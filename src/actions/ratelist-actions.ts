"use server";

import { prisma } from "@/util/prisma";

type TaxKind = "RAWMAT" | "STICKER" | "GLASS";

// matchOn         -> which fields of the row must match a purchase item
// onlyForCategory -> the column only applies to rows of this category name,
//                    every other row gets 0
const TAX_CONFIG: Record<
  TaxKind,
  { matchOn: string[]; onlyForCategory?: string }
> = {
  RAWMAT: { matchOn: ["brandId", "categoryId", "typeId", "qualityId"] },
  STICKER: { matchOn: ["brandId", "categoryId"] },
  GLASS: { matchOn: ["brandId"], onlyForCategory: "visor" },
};

const resolveTaxKind = async (taxId: string): Promise<TaxKind> => {
  const tax = await prisma.comTaxTable.findUnique({
    where: { taxId },
    select: { comName: true },
  });

  const name = (tax?.comName || "").toUpperCase();

  if (name.includes("GLASS")) return "GLASS";
  if (name.includes("STICKER")) return "STICKER";
  return "RAWMAT";
};

// Name comparison is done in JS (trimmed, case-insensitive) because Prisma's
// `mode: "insensitive"` is not available on SQL Server.
const getCategoryIdsByName = async (name: string): Promise<Set<number>> => {
  const categories = await prisma.mstCategory.findMany({
    select: { id: true, categoryName: true },
  });

  const target = name.trim().toLowerCase();

  return new Set(
    categories
      .filter((c) => c.categoryName.trim().toLowerCase() === target)
      .map((c) => c.id),
  );
};

export const rateListFirstSelection = async (taxId: string) => {
  const kind = await resolveTaxKind(taxId);

  const groupByFields: any = TAX_CONFIG[kind].matchOn;

  console.log(groupByFields);

  const result = await prisma.trnPurchaseItem.groupBy({
    by: groupByFields,
    _max: { purchaseRate: true },
    where: {
      purchase: {
        purchaseCategory: taxId,
      },
    },
  });

  console.log("result", result);

  return result.map((item: any) => ({
    brandId: item.brandId ?? null,
    categoryId: item.categoryId ?? null,
    typeId: item.typeId ?? null,
    qualityId: item.qualityId ?? null,
    purchaseRate: Number(item._max.purchaseRate || 0),
  }));
};

export const rateListSecondSelection = async (
  taxId: string,
  combinations: any[],
) => {
  const kind = await resolveTaxKind(taxId);
  const { matchOn, onlyForCategory } = TAX_CONFIG[kind];

  const allowedCategoryIds = onlyForCategory
    ? await getCategoryIdsByName(onlyForCategory)
    : null;

  // Rows that share the same match fields get the same rate, so each distinct
  // key is queried once (sticker: brand + category, glass: brand).
  const rateCache = new Map<string, Promise<number>>();

  const fetchRate = (combo: any): Promise<number> => {
    const key = matchOn.map((f) => combo[f]).join("-");

    let pending = rateCache.get(key);

    if (!pending) {
      const whereClause: any = {
        purchase: {
          purchaseCategory: taxId,
        },
      };

      matchOn.forEach((field) => {
        whereClause[field] = combo[field];
      });

      pending = prisma.trnPurchaseItem
        .aggregate({
          _max: { purchaseRate: true },
          where: whereClause,
        })
        .then((res) => Number(res._max.purchaseRate || 0));

      rateCache.set(key, pending);
    }

    return pending;
  };

  return Promise.all(
    combinations.map(async (combo) => {
      // Column doesn't apply to this row (e.g. glass on a non-visor category)
      if (allowedCategoryIds && !allowedCategoryIds.has(combo.categoryId)) {
        return { ...combo, purchaseRate: 0, applicable: false };
      }

      return {
        ...combo,
        purchaseRate: await fetchRate(combo),
        applicable: true,
      };
    }),
  );
};

export const getRateListByCustomer = async (customerId: number) => {
  const data = await prisma.rateList.findFirst({
    where: { customerId },
    include: {
      columns: true,
      items: {
        include: {
          values: true,
          brand: true,
          category: true,
          type: true,
          quality: true,
        },
      },
      customer: true,
    },
  });

  if (!data) return null;

  return {
    ...data,
    customer: {
      ...data.customer,
      openingBalance: Number(data.customer.openingBalance),
    },
    items: data.items.map((item) => ({
      ...item,

      // ✅ convert decimals
      freight: Number(item.freight),
      labour: Number(item.labour),
      packing: Number(item.packing),
      margin: Number(item.margin),
      wastage: Number(item.wastage),
      total: Number(item.total),
      nettRate: Number(item.nettRate),

      values: item.values.map((val) => ({
        ...val,
        value: Number(val.value), // ✅ important
      })),
    })),
  };
};

export const saveRateList = async ({ customerId, columns, items, }: any) => {
  console.log("customer", customerId);
  return prisma.rateList.upsert({
    where: { customerId },

    update: {
      date: new Date().toISOString(),

      columns: {
        deleteMany: {},
        create: columns.map((col: any, index: number) => ({
          taxId: col.taxId,
          columnIndex: index,
        })),
      },

      items: {
        deleteMany: {},
        create: items.map((item: any) => ({
          brandId: item.brand,
          categoryId: item.category,
          typeId: item.type,
          qualityId: item.quality,

          freight: item.freight || 0,
          labour: item.labour || 0,
          packing: item.packing || 0,
          margin: item.margin || 0,
          wastage: item.wastage || 0,
          total: item.total || 0, 
          nettRate: item.nettRate || 0, 
          

          values: {
            create: item.values.map((val: number, idx: number) => ({
              columnIndex: idx,
              value: val || 0,
            })),
          },
        })),
      },
    },

    create: {
      date: new Date().toISOString(),

      customerId: customerId,

      columns: {
        create: columns.map((col: any, index: number) => ({
          taxId: col.taxId,
          columnIndex: index,
        })),
      },

      items: {
        create: items.map((item: any) => ({
          brandId: item.brand,
          categoryId: item.category,
          typeId: item.type,
          qualityId: item.quality,

          freight: item.freight || 0,
          labour: item.labour || 0,
          packing: item.packing || 0,
          margin: item.margin || 0,
          wastage: item.wastage || 0,

          values: {
            create: item.values.map((val: number, idx: number) => ({
              columnIndex: idx,
              value: val || 0,
            })),
          },
        })),
      },
    },
  });
};