"use server";

import { prisma } from "@/util/prisma";

const TAX_CONFIG: Record<string, any> = {
  RAWMAT: ["brandId", "categoryId", "typeId", "qualityId"],
  STICKER: ["brandId", "categoryId"],
  GLASS: ["brandId"],
};

export const rateListFirstSelection = async (taxId: string) => {
  const tax = await prisma.comTaxTable.findUnique({
    where: { taxId },
    select: { comName: true },
  });

  const taxName = tax?.comName || "RAWMAT";

  const groupByFields = TAX_CONFIG[taxName] || TAX_CONFIG["RAWMAT"];

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
  const tax = await prisma.comTaxTable.findUnique({
    where: { taxId },
    select: { comName: true },
  });

  const taxName = tax?.comName || "RAWMAT";

  const fields = TAX_CONFIG[taxName] || TAX_CONFIG["RAWMAT"];

  const results = await Promise.all(
    combinations.map(async (combo) => {
      const whereClause: any = {
        purchase: {
          purchaseCategory: taxId,
        },
      };

      fields.forEach((field: string) => {
        whereClause[field] = combo[field];
      });

      const res = await prisma.trnPurchaseItem.aggregate({
        _max: { purchaseRate: true },
        where: whereClause,
      });

      return {
        ...combo,
        purchaseRate: Number(res._max.purchaseRate || 0),
      };
    }),
  );

  return results;
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
