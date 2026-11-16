/**
 * Import purchases from an Excel sheet into trnPurchase / trnPurchaseItem.
 *
 * Setup (project root):
 *   npm i -D tsx xlsx
 *   put this file in scripts/import-purchases.ts
 *
 * Run:
 *   npx tsx --env-file=.env scripts/import-purchases.ts ./purchases.xlsx            # dry run, writes nothing
 *   npx tsx --env-file=.env scripts/import-purchases.ts ./purchases.xlsx --commit   # inserts for real
 *
 * Expected headers (row 1): Brand, Type, Quality, Category,
 * Purchase Qty, Purchase Amount, Purchase Rate, Freight / Pcs, Nett Amount
 * (the sheet's Date and Supplier columns are ignored, see PURCHASE_DATE and IMPORT_SUPPLIER)
 */
import * as XLSX from "xlsx";
// adjust if your "@/util/prisma" alias points somewhere else
import { prisma } from "@/util/prisma"

// Tax category (comTaxTable.comName) these purchases belong to.
// The rate list only reads purchases whose purchaseCategory equals this tax's taxId.
const PURCHASE_TAX = "RAWMAT";
const CREATED_BY = "excel-import";

// There are no purchases yet, so the whole import is one purchase with this code.
const PURCHASE_CODE = "PUR00001";

// Every row is booked on this date, whatever the sheet's Date column says.
const PURCHASE_DATE = new Date(Date.UTC(2026, 10, 1)); // 1 November 2026 (months are 0-based)

// Excel row numbers to leave out of the import entirely (row 1 is the header).
const SKIP_ROWS = [335];

// Every row is booked under this supplier, whatever the sheet's Supplier column says.
const IMPORT_SUPPLIER = "Rakesh Rana";

// Suppliers inserted first (only with --commit) if no supplier with that name exists yet.
// supplierCode must be unique: change it to fit your own numbering.
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
    createdBy: CREATED_BY,
  },
];

const file = process.argv[2];
const commit = process.argv.includes("--commit");
const force = process.argv.includes("--force");

const norm = (v: unknown) =>
  String(v ?? "").trim().replace(/\s+/g, " ").toLowerCase();

const num = (v: unknown) => {
  const n = Number(String(v ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : NaN;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

type SupplierRef = {
  key: string;
  code: string;
  gstNumber: string;
  mobileNumber: string;
  id: number | null; // null = doesn't exist yet, created on --commit
};

async function main() {
  if (!file) throw new Error("Usage: tsx import-purchases.ts <file.xlsx> [--commit]");

  const wb = XLSX.readFile(file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    blankrows: true, // keeps row numbers in error messages matching Excel
  });

  const [brands, types, qualities, categories, existingSuppliers, tax] =
    await Promise.all([
      prisma.mstbrand.findMany(),
      prisma.mstType.findMany(),
      prisma.mstQuality.findMany(),
      prisma.mstCategory.findMany(),
      prisma.mstSupplier.findMany(),
      prisma.comTaxTable.findUnique({ where: { comName: PURCHASE_TAX } }),
    ]);
  if (!tax) throw new Error(`Tax "${PURCHASE_TAX}" not found in comTaxTable`);

  const byName = <T>(list: T[], getName: (x: T) => string) =>
    new Map(list.map((x) => [norm(getName(x)), x]));

  const brandMap = byName(brands, (b) => b.brandName);
  const typeMap = byName(types, (t) => t.typeName);
  const qualityMap = byName(qualities, (q) => q.qualityName);
  const categoryMap = byName(categories, (c) => c.categoryName);

  // Suppliers: existing ones first, then the ones we'll create on --commit
  const supplierMap = new Map<string, SupplierRef>();
  for (const s of existingSuppliers) {
    supplierMap.set(norm(s.supplierName), {
      key: norm(s.supplierName),
      code: s.supplierCode,
      gstNumber: s.gstNumber,
      mobileNumber: s.mobileNumber,
      id: s.id,
    });
  }

  const pendingSuppliers: { key: string; data: (typeof SUPPLIERS_TO_CREATE)[number] }[] = [];
  for (const data of SUPPLIERS_TO_CREATE) {
    const key = norm(data.supplierName);
    if (supplierMap.has(key)) continue; // already in the database
    if (existingSuppliers.some((s) => s.supplierCode === data.supplierCode)) {
      throw new Error(
        `Supplier code "${data.supplierCode}" is already used by another supplier. ` +
          `Change it in SUPPLIERS_TO_CREATE.`,
      );
    }
    supplierMap.set(key, {
      key,
      code: data.supplierCode,
      gstNumber: data.gstNumber,
      mobileNumber: data.mobileNumber,
      id: null,
    });
    pendingSuppliers.push({ key, data });
  }

  const importSupplier = supplierMap.get(norm(IMPORT_SUPPLIER));
  if (!importSupplier) {
    throw new Error(
      `Supplier "${IMPORT_SUPPLIER}" doesn't exist and isn't listed in SUPPLIERS_TO_CREATE.`,
    );
  }

  type Line = {
    supplier: SupplierRef;
    brandId: number;
    categoryId: number;
    typeId: number;
    qualityId: number;
    qty: number;
    amount: number;
    rate: number;
    freightPerPcs: number;
    nett: number;
  };

  const lines: Line[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  rows.forEach((r, i) => {
    const rowNo = i + 2; // header is row 1
    if (SKIP_ROWS.includes(rowNo)) {
      console.log(`Skipping row ${rowNo} (${r["Brand"]}, qty ${r["Purchase Qty"]}, amount ${r["Purchase Amount"]})`);
      return;
    }
    if (!norm(r["Brand"]) && !norm(r["Purchase Qty"])) return; // blank / totals row

    const brand = brandMap.get(norm(r["Brand"]));
    const type = typeMap.get(norm(r["Type"]));
    const quality = qualityMap.get(norm(r["Quality"]));
    const category = categoryMap.get(norm(r["Category"]));
    const qty = num(r["Purchase Qty"]);
    const amount = num(r["Purchase Amount"]);
    const rate = num(r["Purchase Rate"]);
    const freightPerPcs = num(r["Freight / Pcs"]);
    const nett = num(r["Nett Amount"]);

    const problems: string[] = [];
    if (!brand) problems.push(`brand "${r["Brand"]}" not found`);
    if (!type) problems.push(`type "${r["Type"]}" not found`);
    if (!quality) problems.push(`quality "${r["Quality"]}" not found`);
    if (!category) problems.push(`category "${r["Category"]}" not found`);
    if (!(qty > 0)) problems.push(`bad qty "${r["Purchase Qty"]}"`);
    if (!Number.isFinite(amount)) problems.push(`bad amount "${r["Purchase Amount"]}"`);
    if (!Number.isFinite(rate)) problems.push(`bad rate "${r["Purchase Rate"]}"`);
    if (!Number.isFinite(freightPerPcs)) problems.push(`bad freight "${r["Freight / Pcs"]}"`);
    if (!Number.isFinite(nett)) problems.push(`bad nett "${r["Nett Amount"]}"`);

    if (problems.length) {
      errors.push(`Row ${rowNo}: ${problems.join("; ")}`);
      return;
    }

    if (Math.abs(qty * rate - amount) > 0.01) {
      warnings.push(`Row ${rowNo}: qty x rate (${r2(qty * rate)}) != amount (${amount})`);
    }

    lines.push({
      supplier: importSupplier,
      brandId: brand!.id,
      categoryId: category!.id,
      typeId: type!.id,
      qualityId: quality!.id,
      qty,
      amount,
      rate,
      freightPerPcs,
      nett,
    });
  });

  if (warnings.length) console.warn("Warnings:\n" + warnings.join("\n"));
  if (errors.length) {
    console.error(`\n${errors.length} row(s) have problems, nothing was imported:\n` + errors.join("\n"));
    process.exit(1);
  }

  // One date for everything, so one purchase per supplier.
  const groups = new Map<string, Line[]>();
  for (const l of lines) {
    const arr = groups.get(l.supplier.key) ?? [];
    arr.push(l);
    groups.set(l.supplier.key, arr);
  }

  const purchases = [...groups.values()].map((items) => {
    const supplier = items[0].supplier;
    return {
      supplier,
      data: {
        purchaseCode: PURCHASE_CODE,
        purchaseDate: PURCHASE_DATE,
        gstNumber: supplier.gstNumber,
        mobileNumber: supplier.mobileNumber,
        subTotal: r2(items.reduce((s, l) => s + l.amount, 0)),
        sgst: 0,
        cgst: 0,
        igst: 0,
        totalTax: 0,
        freight: r2(items.reduce((s, l) => s + l.qty * l.freightPerPcs, 0)),
        roundOff: 0,
        nettAmount: r2(items.reduce((s, l) => s + l.nett, 0)),
        purchaseCategory: tax.taxId,
        createdBy: CREATED_BY,
        items: {
          create: items.map((l) => ({
            brandId: l.brandId,
            categoryId: l.categoryId,
            typeId: l.typeId,
            qualityId: l.qualityId,
            purchaseQty: l.qty,
            purchaseAmount: l.amount,
            purchaseRate: l.rate,
          })),
        },
      },
    };
  });

  // One fixed code means exactly one purchase, and the code must be free.
  if (purchases.length !== 1) {
    throw new Error(`Expected 1 purchase but got ${purchases.length}; every row should go to ${IMPORT_SUPPLIER}.`);
  }
  if (await prisma.trnPurchase.findUnique({ where: { purchaseCode: PURCHASE_CODE }, select: { id: true } })) {
    throw new Error(`Purchase code ${PURCHASE_CODE} already exists. Change PURCHASE_CODE at the top.`);
  }

  // Guard against importing twice: purchases made by this script carry createdBy = CREATED_BY.
  if (!force) {
    const imported = await prisma.trnPurchase.count({ where: { createdBy: CREATED_BY } });
    if (imported) {
      throw new Error(
        `${imported} purchase(s) created by "${CREATED_BY}" already exist, so this file looks already imported. ` +
          `Re-run with --force to import anyway.`,
      );
    }
  }

  const total = r2(purchases.reduce((s, p) => s + p.data.nettAmount, 0));
  if (pendingSuppliers.length) {
    console.log(
      `New supplier(s) to insert first: ${pendingSuppliers.map((s) => s.data.supplierName).join(", ")}`,
    );
  }
  console.log(
    `${lines.length} rows -> ${purchases.length} purchase(s) [${purchases.map((p) => p.data.purchaseCode).join(", ")}] ` +
      `dated ${PURCHASE_DATE.toISOString().slice(0, 10)}, nett total ${total}, tax category ${PURCHASE_TAX}`,
  );

  if (!commit) {
    console.log("Dry run only. Re-run with --commit to insert.");
    return;
  }

  // All-or-nothing: suppliers first, then purchases. If anything fails, nothing is saved.
  await prisma.$transaction(
    async (tx) => {
      const idByKey = new Map<string, number>();
      for (const s of pendingSuppliers) {
        const created = await tx.mstSupplier.create({ data: s.data });
        idByKey.set(s.key, created.id);
        console.log(`Created supplier ${created.supplierName} (id ${created.id})`);
      }

      for (const p of purchases) {
        const supplierId = p.supplier.id ?? idByKey.get(p.supplier.key);
        if (supplierId == null) throw new Error(`No id for supplier "${p.supplier.key}"`);
        await tx.trnPurchase.create({ data: { ...p.data, supplierId } });
      }
    },
    { timeout: 300000, maxWait: 10000 },
  );
  console.log("Imported.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());