// app/actions/masters/salesman/actions.ts
"use server";

import { prisma } from "@/util/prisma";
import { z } from "zod";



const salesmanSchema = z.object({
  salesmanName: z.string().min(1, "Salesman name is required"),
  salesmanAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  openingBalance: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Opening balance must be a valid number",
  }),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  aadharNumber: z.string().optional().default(""),
  panNumber: z.string().optional().default(""),
  bankName: z.string().optional().default(""),
  bankBranch: z.string().optional().default(""),
  accountNumber: z.string().optional().default(""),
  ifscCode: z.string().optional().default(""),
  createdBy: z.string(), 
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export type SalesmanInput = z.infer<typeof salesmanSchema>;

export type Salesman = {
  id: number;
  salesmanCode: string;
  salesmanName: string;
  salesmanAddress: string;
  city: string;
  state: string;
  openingBalance: string, 
  createdBy: string, 
  mobileNumber: string;
  aadharNumber: string;
  panNumber: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  ifscCode: string;
  status: string;
  createdAt: Date;
};

// Get next salesman code
async function getNextSalesmanCode(): Promise<string> {
  const result = await prisma.$executeRaw`
    DECLARE @NextSeq INT;
    
    UPDATE Counter 
    SET @NextSeq = seq = seq + 1 
    WHERE id = 'SALESMAN';
    
    IF @@ROWCOUNT = 0
    BEGIN
      INSERT INTO Counter (id, seq) VALUES ('SALESMAN', 1);
      SET @NextSeq = 1;
    END
    
    SELECT @NextSeq AS nextSeq;
  `;

  const nextSeq = await prisma.$queryRaw<[{ nextSeq: number }]>`
    SELECT seq as nextSeq FROM Counter WHERE id = 'SALESMAN'
  `;

  const seqNumber = nextSeq[0]?.nextSeq || 1;
  return `SALES${String(seqNumber).padStart(6, "0")}`;
}

// Create salesman
export async function createSalesman(input: SalesmanInput) {
  try {
    const validated = salesmanSchema.parse(input);
    const salesmanCode = await getNextSalesmanCode();

    const salesman = await prisma.mstSalesman.create({
      data: {
        salesmanCode,
        salesmanName: validated.salesmanName,
        salesmanAddress: validated.salesmanAddress,
        city: validated.city,
        state: validated.state,
        mobileNumber: validated.mobileNumber,
        aadharNumber: validated.aadharNumber || "",
        panNumber: validated.panNumber || "",
        bankName: validated.bankName || "",
        bankBranch: validated.bankBranch || "",
        accountNumber: validated.accountNumber || "",
        ifscCode: validated.ifscCode || "",
        status: validated.status || "active",
      },
    });

    return {
      success: true,
      data: salesman as Salesman,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create salesman",
    };
  }
}

// Update salesman
export async function updateSalesman(salesmanCode: string, input: SalesmanInput) {
  try {
    const validated = salesmanSchema.parse(input);

    const salesman = await prisma.mstSalesman.update({
      where: { salesmanCode },
      data: {
        salesmanName: validated.salesmanName,
        salesmanAddress: validated.salesmanAddress,
        city: validated.city,
        state: validated.state,
        mobileNumber: validated.mobileNumber,
        aadharNumber: validated.aadharNumber || "",
        panNumber: validated.panNumber || "",
        bankName: validated.bankName || "",
        bankBranch: validated.bankBranch || "",
        accountNumber: validated.accountNumber || "",
        ifscCode: validated.ifscCode || "",
        status: validated.status || "active",
      },
    });

    return {
      success: true,
      data: salesman as Salesman,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update salesman",
    };
  }
}

// Delete salesman
export async function deleteSalesman(salesmanCode: string) {
  try {
    await prisma.mstSalesman.delete({
      where: { salesmanCode },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete salesman",
    };
  }
}

// Get all salesman
export async function getAllSalesmen(): Promise<Salesman[]> {
  const salesmen = await prisma.mstSalesman.findMany({
    orderBy: { createdAt: "desc" },
  });

  return salesmen as Salesman[];
}