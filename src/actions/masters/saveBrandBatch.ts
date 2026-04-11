"use server";

import { prisma } from "@/util/prisma";

type BrandInput = {
  id?: number;
  brandCode: string;
  brandName: string;
  taxIds: string[];
};

type BatchOperations = {
  create: BrandInput[];
  update: BrandInput[];
  delete: number[];
};

export async function saveBrandBatch(operations: BatchOperations) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // DELETE
      if (operations.delete.length > 0) {
        await tx.mstbrand.deleteMany({
          where: {
            id: { in: operations.delete },
          },
        });
      }

      // UPDATE
      console.log(operations.update);
      for (const item of operations.update) {
        await tx.mstbrand.update({
          where: { id: item.id },
          data: {
            brandCode: item.brandCode,
            brandName: item.brandName,
            taxes: {
              set: item.taxIds.map((id) => ({ taxId: id })), // 🔥 replace all
            },
          },
        });
      }

      // CREATE
      for (const item of operations.create) {
        await tx.mstbrand.create({
          data: {
            brandCode: item.brandCode,
            brandName: item.brandName,
            taxes: {
              connect: item.taxIds.map((id) => ({ taxId: id })),
            },
          },
        });
      }

      // RETURN WITH TAX
      const all = await tx.mstbrand.findMany({
        include: {
          taxes: true, // 🔥 plural
        },
        orderBy: { id: "asc" },
      });

      return all;
    });

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to save brands",
    };
  }
}
