// app/actions/masters/customer/actions.ts
"use server";

import { prisma } from "@/util/prisma";
import { z } from "zod";



const customerSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerAddress: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  mobileNumber: z.string().regex(/^\d{10}$/, "Mobile must be 10 digits"),
  openingBalance: z.string().refine((val) => !isNaN(parseFloat(val)), {
    message: "Opening balance must be a valid number",
  }),
  createdBy: z.string().min(1, "Created by is required"),
  gstNumber: z.string().min(1, "GST number is required"),
  aadharNumber: z.string().optional().default(""),
  panNumber: z.string().optional().default(""),
  bankName: z.string().optional().default(""),
  bankBranch: z.string().optional().default(""),
  salesmanId: z.number(),
  accountNumber: z.string().optional().default(""),
  ifscCode: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]).optional().default("active"),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export type Customer = {
  id: number;
  customerCode: string;
  customerName: string;
  customerAddress: string;
  city: string;
  state: string;
  mobileNumber: string;
  openingBalance: string;
  createdBy: string;
  gstNumber: string;
  aadharNumber: string;
  panNumber: string;
  bankName: string;
  bankBranch: string;
  accountNumber: string;
  salesmanId: number; 
  ifscCode: string;
  status: string;
  createdAt: Date;
};


async function getNextCustomerCode(): Promise<string> {
  const result = await prisma.$executeRaw`
    DECLARE @NextSeq INT;
    
    UPDATE Counter 
    SET @NextSeq = seq = seq + 1 
    WHERE id = 'CUSTOMER';
    
    IF @@ROWCOUNT = 0
    BEGIN
      INSERT INTO Counter (id, seq) VALUES ('CUSTOMER', 1);
      SET @NextSeq = 1;
    END
    
    SELECT @NextSeq AS nextSeq;
  `;

  const nextSeq = await prisma.$queryRaw<[{ nextSeq: number }]>`
    SELECT seq as nextSeq FROM Counter WHERE id = 'CUSTOMER'
  `;

  const seqNumber = nextSeq[0]?.nextSeq || 1;
  return `CUST${String(seqNumber).padStart(6, "0")}`;
}

// Create customer
export async function createCustomer(input: CustomerInput) {
  try {
    const validated = customerSchema.parse(input);
    const customerCode = await getNextCustomerCode();

    const customer = await prisma.mstCustomer.create({
      data: {
        customerCode,
        customerName: validated.customerName,
        customerAddress: validated.customerAddress,
        city: validated.city,
        state: validated.state,
        mobileNumber: validated.mobileNumber,
        openingBalance: validated.openingBalance,
        createdBy: validated.createdBy,
        gstNumber: validated.gstNumber,
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
      data: {
        ...customer,
        openingBalance: customer.openingBalance.toString(),
      } as Customer,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create customer",
    };
  }
}

// Update customer
export async function updateCustomer(customerCode: string, input: CustomerInput) {
  try {
    const validated = customerSchema.parse(input);

    const customer = await prisma.mstCustomer.update({
      where: { customerCode },
      data: {
        customerName: validated.customerName,
        customerAddress: validated.customerAddress,
        city: validated.city,
        state: validated.state,
        mobileNumber: validated.mobileNumber,
        openingBalance: validated.openingBalance,
        createdBy: validated.createdBy,
        gstNumber: validated.gstNumber,
        aadharNumber: validated.aadharNumber || "",
        panNumber: validated.panNumber || "",
        bankName: validated.bankName || "",
        bankBranch: validated.bankBranch || "",
        salesmanId: validated.salesmanId, 
        accountNumber: validated.accountNumber || "",
        ifscCode: validated.ifscCode || "",
        status: validated.status || "active",
      },
    });

    return {
      success: true,
      data: {
        ...customer,
        openingBalance: customer.openingBalance.toString(),
      } as Customer,
    };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: "Validation failed",
        issues: error.issues,
      };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update customer",
    };
  }
}

export async function deleteCustomer(customerCode: string) {
  try {
    await prisma.mstCustomer.delete({
      where: { customerCode },
    });

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete customer",
    };
  }
}

// Get all customers
export async function getAllCustomers(): Promise<Customer[]> {
  const customers = await prisma.mstCustomer.findMany({
    orderBy: { createdAt: "desc" },
  });

  return customers.map((customer: any) => ({
    ...customer,
    openingBalance: customer.openingBalance.toString(),
  }));
}

export const getSalesmen = async () => {
  return prisma.mstSalesman.findMany({
    where: { status: "active" },
    orderBy: { salesmanName: "asc" },
  });
};