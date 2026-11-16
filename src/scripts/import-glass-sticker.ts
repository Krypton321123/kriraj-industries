/**
 * Import GLASS or STICKER purchases from Excel into trnPurchase / trnPurchaseItem.
 *
 * From the project root (quote the file names, they contain spaces):
 *
 *   npx tsx --env-file=.env src/scripts/import-glass-sticker.ts glass   "src/scripts/KR GLASSData.xlsx"      # dry run
 *   npx tsx --env-file=.env src/scripts/import-glass-sticker.ts sticker "src/scripts/KR STICKER Data.xlsx"   # dry run
 *
 * Add --commit to really insert. Nothing is written without it.
 *
 * Like the first import: every row goes under IMPORT_SUPPLIER, dated PURCHASE_DATE
 * (the sheet's Date and Supplier columns are ignored), as ONE purchase with the next PUR code.
 */
import * as XLSX from "xlsx";
// same alias your app uses; tsx reads it from tsconfig.json, so it works from any folder.
// If it ever fails to resolve, use a relative path instead (from src/scripts: "../util/prisma").
import { prisma } from "@/util/prisma";

// ---------- settings shared by both imports ----------

const PURCHASE_DATE = new Date(Date.UTC(2026, 10, 1)); // 1 November 2026 (months are 0-based)
const IMPORT_SUPPLIER = "Rakesh Rana";
const TYPE_NOT_APPLICABLE = "NOT APPLICABLE"; // mstType row used for every item (sheets have no type)
const CODE_PREFIX = "PUR";

// Inserted first (only with --commit) if no supplier with IMPORT_SUPPLIER's name exists yet.
const SUPPLIERS_TO_CREATE = [
  {
    supplierCode: "SUP-RAKESH-RANA",
    supplierName: "Rakesh Rana",
    supplierAddress: "",
    city: "",
    state: "",
    mobileNumber: "",
    openingBalance: "0",
    gstNumber: "",
    createdBy: "excel-import",
  },
];

// ---------- per-file settings ----------
// trnPurchaseItem only stores brand / category / type / quality IDs, so each sheet column
// is looked up in one of those masters. The dry run reports any name that doesn't match.

type Profile = {
  tax: string; // comTaxTable.comName -> trnPurchase.purchaseCategory
  createdBy: string; // also used to stop the same file being imported twice
  brand: string; // sheet column -> mstbrand
  category: string; // sheet column -> mstCategory
  quality: string; // sheet column -> mstQuality
  skipRows: number[]; // Excel row numbers to leave out (row 1 is the header)
  // Sheet value -> name in your master, where they are spelled differently.
  // Keys are matched ignoring case and extra spaces.
  aliases: { category: Record<string, string>; quality: Record<string, string> };
  // Master name to use when the sheet's quality cell is blank (null = blank is an error)
  blankQuality: string | null;
  // Master name to use for ANY quality that isn't found in the master (null = it's an error)
  qualityIfNotFound: string | null;
  // true = rows whose brand or category isn't found are skipped (and listed) instead of being errors
  skipUnmatched: boolean;
};

const PROFILES: Record<"glass" | "sticker", Profile> = {
  glass: {
    tax: "GLASS",
    createdBy: "excel-import-glass",
    brand: "Brand",
    category: "Glass Category",
    quality: "Glass Quality",
    skipRows: [62], // blank brand
    aliases: {
      category: { "Pench Kit": "PENCHKIT" },
      quality: { Black: "BLACK/NORMAL", Transparent: "TP/GREEN" },
    },
    blankQuality: "NOT APPLICABLE",
    qualityIfNotFound: null,
    skipUnmatched: false,
  },
  sticker: {
    tax: "STICKER",
    createdBy: "excel-import-sticker",
    brand: "Brand",
    category: "Category", // Panel / Visor
    quality: "Quality", // Normal
    skipRows: [],
    aliases: { category: {}, quality: {} },
    blankQuality: null,
    qualityIfNotFound: "Normal", // Visor Rubber, Log Rubber, Monogram, IBS, ... all become Normal
    skipUnmatched: true, // rows with a missing/unknown brand or category are left out
  },
};
type ProfileKey = keyof typeof PROFILES;

// ---------- helpers ----------

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const force = args.includes("--force");
const [kind, file] = args.filter((a) => !a.startsWith("--"));

const norm = (v: unknown) => String(v ?? "").trim().replace(/\s+/g, " ").toLowerCase();
const blank = (v: unknown) => String(v ?? "").trim() === "";
const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};
const r2 = (n: number) => Math.round(n * 100) / 100;
const get = (r: Record<string, unknown>, header: string) => r[norm(header)];
const normKeys = (o: Record<string, string>) =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [norm(k), v]));
// The name to look up in the master: blank -> fallback, otherwise alias if there is one
const resolveName = (text: string, aliases: Record<string, string>, fallback: string | null) =>
  text ? (aliases[norm(text)] ?? text) : (fallback ?? "");
const shown = (text: string, name: string) =>
  name === text ? `"${text}"` : `"${text}" (looked up as "${name}")`;

// ---------- main ----------

async function main() {
  const profile = PROFILES[kind as ProfileKey];
  if (!profile || !file) {
    throw new Error('Usage: tsx import-glass-sticker.ts <glass|sticker> "<file.xlsx>" [--commit]');
  }

  const categoryAliases = normKeys(profile.aliases.category);
  const qualityAliases = normKeys(profile.aliases.quality);
  const adjusted = new Map<string, number>();
  const countAdjusted = (what: string) => adjusted.set(what, (adjusted.get(what) ?? 0) + 1);

  // Read the sheet; header names are matched ignoring case and extra spaces
  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils
    .sheet_to_json<Record<string, unknown>>(sheet, { defval: "", blankrows: true })
    .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [norm(k), v])) as Record<string, unknown>);
  if (!rows.length) throw new Error("The sheet has no rows.");

  const found = Object.keys(rows[0]);
  const required = [profile.brand, profile.category, profile.quality, "Purchase Qty", "Purchase Amount", "Purchase Rate"];
  const missing = required.filter((h) => !found.includes(norm(h)));
  if (missing.length) {
    throw new Error(
      `Column(s) not found in the sheet: ${missing.join(", ")}.\nColumns I can see: ${found.join(", ")}`,
    );
  }

  const [brands, categories, qualities, types, existingSuppliers, tax] = await Promise.all([
    prisma.mstbrand.findMany(),
    prisma.mstCategory.findMany(),
    prisma.mstQuality.findMany(),
    prisma.mstType.findMany(),
    prisma.mstSupplier.findMany(),
    prisma.comTaxTable.findUnique({ where: { comName: profile.tax } }),
  ]);

  if (!tax) {
    const all = await prisma.comTaxTable.findMany({ select: { comName: true } });
    throw new Error(
      `Tax "${profile.tax}" not found in comTaxTable. Available: ${all.map((t) => t.comName).join(", ")}`,
    );
  }

  const byName = <T>(list: T[], getName: (x: T) => string) =>
    new Map(list.map((x) => [norm(getName(x)), x]));
  const brandMap = byName(brands, (b) => b.brandName);
  const categoryMap = byName(categories, (c) => c.categoryName);
  const qualityMap = byName(qualities, (q) => q.qualityName);
  const typeMap = byName(types, (t) => t.typeName);

  if (profile.qualityIfNotFound && !qualityMap.has(norm(profile.qualityIfNotFound))) {
    throw new Error(`Quality "${profile.qualityIfNotFound}" (qualityIfNotFound) not found in the quality master.`);
  }

  const typeNA = typeMap.get(norm(TYPE_NOT_APPLICABLE));
  if (!typeNA) throw new Error(`Type "${TYPE_NOT_APPLICABLE}" not found in the type master (mstType).`);

  // Supplier: existing one, or the one we create on --commit
  const existingSupplier = existingSuppliers.find((s) => norm(s.supplierName) === norm(IMPORT_SUPPLIER));
  const newSupplier = existingSupplier
    ? undefined
    : SUPPLIERS_TO_CREATE.find((s) => norm(s.supplierName) === norm(IMPORT_SUPPLIER));
  const contact = existingSupplier ?? newSupplier;
  if (!contact) {
    throw new Error(`Supplier "${IMPORT_SUPPLIER}" doesn't exist and isn't listed in SUPPLIERS_TO_CREATE.`);
  }
  if (newSupplier && existingSuppliers.some((s) => s.supplierCode === newSupplier.supplierCode)) {
    throw new Error(
      `Supplier code "${newSupplier.supplierCode}" is already used by another supplier. Change it in SUPPLIERS_TO_CREATE.`,
    );
  }

  // Validate every row
  type Line = {
    brandId: number;
    categoryId: number;
    qualityId: number;
    qty: number;
    amount: number;
    rate: number;
    freightPerPcs: number;
    nett: number;
  };
  const lines: Line[] = [];
  const problems = new Map<string, number[]>(); // message -> Excel row numbers
  const warnings: string[] = [];
  const skipped = new Map<string, number[]>(); // reason -> Excel row numbers
  let skippedAmount = 0;

  rows.forEach((r, i) => {
    const rowNo = i + 2; // header is row 1
    if (profile.skipRows.includes(rowNo)) {
      console.log(`Skipping row ${rowNo} (${get(r, profile.brand)})`);
      return;
    }
    if (blank(get(r, profile.brand)) && blank(get(r, "Purchase Qty"))) return; // blank / totals row

    const rowProblems: string[] = [];
    const rowAdjusted: string[] = []; // only counted if the row is actually imported

    const brand = brandMap.get(norm(get(r, profile.brand)));
    if (!brand) rowProblems.push(`brand "${get(r, profile.brand)}" not found`);

    const categoryText = String(get(r, profile.category) ?? "").trim();
    const categoryName = resolveName(categoryText, categoryAliases, null);
    const category = categoryMap.get(norm(categoryName));
    if (!category) {
      rowProblems.push(`category (sheet "${profile.category}") ${shown(categoryText, categoryName)} not found`);
    } else if (categoryName !== categoryText) {
      rowAdjusted.push(`category "${categoryText || "(blank)"}" -> "${category.categoryName}"`);
    }

    // Unknown brand or category: leave the whole row out, but keep a record of it
    if (profile.skipUnmatched && (!brand || !category)) {
      const why = [
        !brand && `brand "${get(r, profile.brand)}" not found`,
        !category && `category ${shown(categoryText, categoryName)} not found`,
      ]
        .filter(Boolean)
        .join(" + ");
      skipped.set(why, [...(skipped.get(why) ?? []), rowNo]);
      const a = num(get(r, "Purchase Amount"));
      if (Number.isFinite(a)) skippedAmount += a;
      return;
    }

    const qualityText = String(get(r, profile.quality) ?? "").trim();
    const qualityName = resolveName(qualityText, qualityAliases, profile.blankQuality);
    let quality = qualityMap.get(norm(qualityName));
    if (!quality && profile.qualityIfNotFound) quality = qualityMap.get(norm(profile.qualityIfNotFound));
    if (!quality) {
      rowProblems.push(`quality (sheet "${profile.quality}") ${shown(qualityText, qualityName)} not found`);
    } else if (norm(quality.qualityName) !== norm(qualityText)) {
      rowAdjusted.push(`quality "${qualityText || "(blank)"}" -> "${quality.qualityName}"`);
    }

    const qty = num(get(r, "Purchase Qty"));
    if (!(qty > 0)) rowProblems.push(`bad Purchase Qty "${get(r, "Purchase Qty")}"`);
    const amount = num(get(r, "Purchase Amount"));
    if (!Number.isFinite(amount)) rowProblems.push(`bad Purchase Amount "${get(r, "Purchase Amount")}"`);
    const rate = num(get(r, "Purchase Rate"));
    if (!Number.isFinite(rate)) rowProblems.push(`bad Purchase Rate "${get(r, "Purchase Rate")}"`);

    // Freight / Nett are optional: freight defaults to 0 and nett to amount + freight
    const freightRaw = get(r, "Freight / Pcs");
    const freightPerPcs = blank(freightRaw) ? 0 : num(freightRaw);
    if (!Number.isFinite(freightPerPcs)) rowProblems.push(`bad Freight / Pcs "${freightRaw}"`);
    const nettRaw = get(r, "Nett Amount");
    const nett = blank(nettRaw) ? r2(amount + qty * freightPerPcs) : num(nettRaw);
    if (!Number.isFinite(nett)) rowProblems.push(`bad Nett Amount "${nettRaw}"`);

    if (rowProblems.length) {
      for (const msg of rowProblems) problems.set(msg, [...(problems.get(msg) ?? []), rowNo]);
      return;
    }

    if (Math.abs(qty * rate - amount) > 0.01) {
      warnings.push(`Row ${rowNo}: qty x rate (${r2(qty * rate)}) != amount (${amount})`);
    }

    rowAdjusted.forEach(countAdjusted);
    lines.push({
      brandId: brand!.id,
      categoryId: category!.id,
      qualityId: quality!.id,
      qty,
      amount,
      rate,
      freightPerPcs,
      nett,
    });
  });

  if (warnings.length) {
    console.warn(`Warnings (${warnings.length}):\n` + warnings.slice(0, 10).join("\n"));
    if (warnings.length > 10) console.warn(`...and ${warnings.length - 10} more`);
  }
  if (problems.size) {
    const badRows = new Set([...problems.values()].flat()).size;
    console.error(`\n${badRows} row(s) have problems, nothing was imported:`);
    for (const [msg, rowNos] of problems) {
      console.error(`  ${msg}: ${rowNos.length} row(s), e.g. row ${rowNos.slice(0, 5).join(", ")}`);
    }
    process.exit(1);
  }
  if (!lines.length) throw new Error("No importable rows found.");

  // Next purchase code: highest existing number + 1 (PUR00001 if there are none yet)
  const existingCodes = await prisma.trnPurchase.findMany({
    where: { purchaseCode: { startsWith: CODE_PREFIX } },
    select: { purchaseCode: true },
  });
  let prefix = CODE_PREFIX;
  let width = 5;
  let max = 0;
  for (const { purchaseCode } of existingCodes) {
    const m = purchaseCode.match(/^(.*?)(\d+)$/);
    if (!m) continue;
    const n = Number(m[2]);
    if (n >= max) {
      max = n;
      prefix = m[1];
      width = m[2].length;
    }
  }
  const purchaseCode = prefix + String(max + 1).padStart(width, "0");

  // Guard against importing the same file twice
  if (!force) {
    const imported = await prisma.trnPurchase.count({ where: { createdBy: profile.createdBy } });
    if (imported) {
      throw new Error(
        `${imported} purchase(s) created by "${profile.createdBy}" already exist, so this file looks already imported. ` +
          `Re-run with --force to import anyway.`,
      );
    }
  }

  const purchase = {
    purchaseCode,
    purchaseDate: PURCHASE_DATE,
    gstNumber: contact.gstNumber,
    mobileNumber: contact.mobileNumber,
    subTotal: r2(lines.reduce((s, l) => s + l.amount, 0)),
    sgst: 0,
    cgst: 0,
    igst: 0,
    totalTax: 0,
    freight: r2(lines.reduce((s, l) => s + l.qty * l.freightPerPcs, 0)),
    roundOff: 0,
    nettAmount: r2(lines.reduce((s, l) => s + l.nett, 0)),
    purchaseCategory: tax.taxId,
    createdBy: profile.createdBy,
    items: {
      create: lines.map((l) => ({
        brandId: l.brandId,
        categoryId: l.categoryId,
        typeId: typeNA.id,
        qualityId: l.qualityId,
        purchaseQty: l.qty,
        purchaseAmount: l.amount,
        purchaseRate: l.rate,
      })),
    },
  };

  console.log(
    `Mapping: "${profile.brand}" -> brand, "${profile.category}" -> category, ` +
      `"${profile.quality}" -> quality, type -> ${typeNA.typeName} (id ${typeNA.id})`,
  );
  for (const [what, n] of adjusted) console.log(`Adjusted: ${what} (${n} row(s))`);
  if (skipped.size) {
    const total = [...skipped.values()].reduce((n, a) => n + a.length, 0);
    console.log(`Skipped ${total} row(s) with a missing/unknown brand or category (their purchase amounts total ${r2(skippedAmount)}):`);
    for (const [why, rowNos] of skipped) console.log(`  ${why}: ${rowNos.length} row(s): ${rowNos.join(", ")}`);
  }
  if (newSupplier) console.log(`Supplier "${IMPORT_SUPPLIER}" doesn't exist yet and will be inserted first.`);
  console.log(
    `${lines.length} rows -> 1 purchase [${purchaseCode}] under ${IMPORT_SUPPLIER}, ` +
      `dated ${PURCHASE_DATE.toISOString().slice(0, 10)}, nett total ${purchase.nettAmount}, tax ${profile.tax}`,
  );

  if (!commit) {
    console.log("Dry run only. Re-run with --commit to insert.");
    return;
  }

  // All-or-nothing: supplier first (if needed), then the purchase
  await prisma.$transaction(
    async (tx) => {
      let supplierId = existingSupplier?.id;
      if (newSupplier) {
        const created = await tx.mstSupplier.create({ data: newSupplier });
        supplierId = created.id;
        console.log(`Created supplier ${created.supplierName} (id ${created.id})`);
      }
      if (supplierId == null) throw new Error("No supplier id");
      await tx.trnPurchase.create({ data: { ...purchase, supplierId } });
    },
    { timeout: 300000, maxWait: 10000 },
  );
  console.log(`Imported as ${purchaseCode}.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());