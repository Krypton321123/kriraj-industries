"use server";

import { prisma } from "@/util/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";



const supplierSchema = z.object({
  supplierName: z.string().min(1, "Supplier name is required"),
  supplierAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
  openingBalance: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Opening balance must be a valid number",
  }),
  aadharNumber: z.string().default(""),
  panNumber: z.string().default(""),
  bankName: z.string().default(""),
  bankBranch: z.string().default(""),
  accountNumber: z.string().default(""),
  ifscCode: z.string().default(""),
  status: z.enum(["active", "inactive"]).default("active"),
  createdBy: z.string().min(1, "Created by is required"),
  gstNumber: z.string().min(15, "GST number must be 15 characters").max(15),
});

export type SupplierInput = z.infer<typeof supplierSchema>;

export type Supplier = {
  id: number;
  supplierCode: string;
  supplierName: string;
  supplierAddress: string;
  city: string;
  state: string;
  mobileNumber: string;
  openingBalance: string;
  panNumber: string; 
  aadharNumber: string; 
  bankName: string; 
  status: string; 
  bankBranch: string; 
  accountNumber: string; 
  ifscCode: string; 
  createdBy: string;
  gstNumber: string;
  createdAt: Date;
};

type ActionResult<T = Supplier> =
  | { success: true; data: T }
  | {
      success: false;
      error: string;
      issues?: Array<{ field: string; message: string }>;
    };

async function getNextSupplierCode(): Promise<string> {
  const counterId = "SUPPLIER";

  await prisma.$executeRaw`
    IF NOT EXISTS (SELECT 1 FROM Counter WHERE id = ${counterId})
    BEGIN
      INSERT INTO Counter (id, seq) VALUES (${counterId}, 0)
    END
  `;

  const result = await prisma.$executeRaw`
    UPDATE Counter 
    SET seq = seq + 1 
    OUTPUT INSERTED.seq
    WHERE id = ${counterId}
  `;

  const counter = await prisma.counter.findUnique({
    where: { id: counterId },
  });

  if (!counter) {
    throw new Error("Failed to get supplier code");
  }

  return `SUP${String(counter.seq).padStart(4, "0")}`;
}

export async function createSupplier(
  data: SupplierInput
): Promise<ActionResult> {
  try {
    const validation = supplierSchema.safeParse(data);

if (!validation.success) {
  return {
    success: false,
    error: "Validation failed",   // ← add this line
    issues: validation.error.issues.map((issue) => ({
      field: issue.path[0] as string,
      message: issue.message,
    })),
  };
}

    const supplierCode = await getNextSupplierCode();

    const supplier = await prisma.mstSupplier.create({
      data: {
        supplierCode,
        supplierName: validation.data.supplierName,
        supplierAddress: validation.data.supplierAddress,
        city: validation.data.city,
        ifscCode: validation.data.ifscCode, 
        bankName: validation.data.bankName, 
        bankBranch: validation.data.bankBranch, 
        aadharNumber: validation.data.aadharNumber, 
        accountNumber: validation.data.accountNumber, 
        panNumber: validation.data.panNumber, 
        status: validation.data.status, 
        state: validation.data.state,
        mobileNumber: validation.data.mobileNumber,
        openingBalance: validation.data.openingBalance,
        createdBy: validation.data.createdBy,
        gstNumber: validation.data.gstNumber,
      },
    });

    revalidatePath("/suppliers");

    return {
      success: true,
      data: {
        ...supplier,
        createdAt: supplier.createdAt,
      },
    };
  } catch (error) {
    console.error("Create supplier error:", error);
    return {
      success: false,
      error: "Failed to create supplier. Please try again.",
    };
  }
}

export async function updateSupplier(
  supplierCode: string,
  data: SupplierInput
): Promise<ActionResult> {
  try {
    const validation = supplierSchema.safeParse(data);
if (!validation.success) {
  return {
    success: false,
    error: "Validation failed",   // ← add this line
    issues: validation.error.issues.map((issue) => ({
      field: issue.path[0] as string,
      message: issue.message,
    })),
  };
    }

    const existingSupplier = await prisma.mstSupplier.findFirst({
      where: { supplierCode },
    });

    if (!existingSupplier) {
      return {
        success: false,
        error: "Supplier not found",
      };
    }

    const supplier = await prisma.mstSupplier.update({
      where: { id: existingSupplier.id },
      data: {
        supplierName: validation.data.supplierName,
        supplierAddress: validation.data.supplierAddress,
        city: validation.data.city,
        state: validation.data.state,
        ifscCode: validation.data.ifscCode, 
        bankName: validation.data.bankName, 
        bankBranch: validation.data.bankBranch, 
        aadharNumber: validation.data.aadharNumber, 
        accountNumber: validation.data.accountNumber, 
        panNumber: validation.data.panNumber, 
        status: validation.data.status, 
        mobileNumber: validation.data.mobileNumber,
        openingBalance: validation.data.openingBalance,
        createdBy: validation.data.createdBy,
        gstNumber: validation.data.gstNumber,
      },
    });

    revalidatePath("/suppliers");

    return {
      success: true,
      data: {
        ...supplier,
        createdAt: supplier.createdAt,
      },
    };
  } catch (error) {
    console.error("Update supplier error:", error);
    return {
      success: false,
      error: "Failed to update supplier. Please try again.",
    };
  }
}

export async function deleteSupplier(
  supplierCode: string
): Promise<ActionResult<void>> {
  try {
    const existingSupplier = await prisma.mstSupplier.findFirst({
      where: { supplierCode },
    });

    if (!existingSupplier) {
      return {
        success: false,
        error: "Supplier not found",
      };
    }

    await prisma.mstSupplier.delete({
      where: { id: existingSupplier.id },
    });

    revalidatePath("/suppliers");

    return {
      success: true,
      data: undefined as void,
    };
  } catch (error) {
    console.error("Delete supplier error:", error);
    return {
      success: false,
      error: "Failed to delete supplier. Please try again.",
    };
  }
}

export async function getSuppliers(): Promise<Supplier[]> {
  try {
    const suppliers = await prisma.mstSupplier.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return suppliers.map((supplier) => ({
      ...supplier,
      createdAt: supplier.createdAt,
    }));
  } catch (error) {
    console.error("Get suppliers error:", error);
    return [];
  }
}