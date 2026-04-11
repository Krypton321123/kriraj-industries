"use server";

import { prisma } from "@/util/prisma";
import { z } from "zod";

// ===============================
// VALIDATION
// ===============================

const taxSchema = z.object({
  comName: z.string().min(1, "Tax name is required"),
  igst: z.number().min(0),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
});

export type TaxInput = z.infer<typeof taxSchema>;

export type Tax = {
  taxId: string;
  comName: string;
  igst: number;
  cgst: number;
  sgst: number;
  createdAt: Date;
  updatedAt: Date;
};


// ===============================
// CREATE TAX
// ===============================

export async function createTax(input: TaxInput) {
  try {
    const validated = taxSchema.parse(input);

    const tax = await prisma.comTaxTable.create({
      data: {
        comName: validated.comName.toUpperCase(), // 🔥 normalize
        igst: validated.igst,
        cgst: validated.cgst,
        sgst: validated.sgst,
      },
    });

    return {
      success: true,
      data: tax,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create tax",
    };
  }
}


// ===============================
// UPDATE TAX
// ===============================

export async function updateTax(taxId: string, input: TaxInput) {
  try {
    const validated = taxSchema.parse(input);

    const tax = await prisma.comTaxTable.update({
      where: { taxId },
      data: {
        comName: validated.comName.toUpperCase(),
        igst: validated.igst,
        cgst: validated.cgst,
        sgst: validated.sgst,
      },
    });

    return {
      success: true,
      data: tax,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update tax",
    };
  }
}


// ===============================
// DELETE TAX
// ===============================

export async function deleteTax(taxId: string) {
  try {
    await prisma.comTaxTable.delete({
      where: { taxId },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete tax",
    };
  }
}


// ===============================
// GET ALL TAXES
// ===============================

export async function getAllTaxes(): Promise<Tax[]> {
  const taxes = await prisma.comTaxTable.findMany({
    orderBy: { createdAt: "desc" },
  });

  console.log("taxes", taxes)

  return taxes;
}