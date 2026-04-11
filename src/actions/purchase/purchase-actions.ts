"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/util/prisma";


export type PurchaseItem = {
  brandId: number;
  categoryId: number;
  typeId: number;
  qualityId: number;
  purchaseQty: number;
  purchaseAmount: number;
  purchaseRate: number;
};

export type PurchaseFormData = {
  supplierId: number;
  purchaseDate: Date;
  items: PurchaseItem[];
  subTotal: number;
  purchaseCategory: string;
  sgst: number;
  cgst: number;
  igst: number;
  totalTax: number;
  freight: number;
  roundOff: number;
  nettAmount: number;
  remarks?: string;
  createdBy: string;
};

// Generate next purchase code
export async function getNextPurchaseCode() {
  try {
    const counter = await prisma.counter.findUnique({
      where: { id: "PURCHASE" },
    });

    let nextSeq = 1;
    if (counter) {
      nextSeq = counter.seq + 1;
    } else {
      await prisma.counter.create({
        data: {
          id: "PURCHASE",
          seq: 1,
        },
      });
    }

    const purchaseCode = `PUR${String(nextSeq).padStart(5, "0")}`;
    return { success: true, purchaseCode, seq: nextSeq };
  } catch (error) {
    console.error("Error generating purchase code:", error);
    return { success: false, error: "Failed to generate purchase code" };
  }
}

// Get all suppliers
export async function getSuppliers() {
  try {
    const suppliers = await prisma.mstSupplier.findMany({
      where: { status: "active" },
      orderBy: { supplierName: "asc" },
    });
    return { success: true, data: suppliers };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, error: "Failed to fetch suppliers" };
  }
}

// Get supplier by ID
export async function getSupplierById(id: number) {
  try {
    const supplier = await prisma.mstSupplier.findUnique({
      where: { id },
    });
    return { success: true, data: supplier };
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return { success: false, error: "Failed to fetch supplier" };
  }
}

// Get all brands
export async function getBrands() {
  try {
    const brands = await prisma.mstbrand.findMany({
      orderBy: { brandName: "asc" }, 
      include: {taxes: true}
    });
    console.log(brands)
    return { success: true, data: brands };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return { success: false, error: "Failed to fetch brands" };
  }
}

// Get all categories
export async function getCategories() {
  try {
    const categories = await prisma.mstCategory.findMany({
      orderBy: { categoryName: "asc" },
      include: {taxes: true}
    });
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

// Get all types
export async function getTypes() {
  try {
    const types = await prisma.mstType.findMany({
      orderBy: { typeName: "asc" },
      include: {taxes: true}
    });
    return { success: true, data: types };
  } catch (error) {
    console.error("Error fetching types:", error);
    return { success: false, error: "Failed to fetch types" };
  }
}

// Get all qualities
export async function getQualities() {
  try {
    const qualities = await prisma.mstQuality.findMany({
      orderBy: { qualityName: "asc" },
      include: {taxes: true}
    });
    return { success: true, data: qualities };
  } catch (error) {
    console.error("Error fetching qualities:", error);
    return { success: false, error: "Failed to fetch qualities" };
  }
}

// Get old purchases based on brand, category, type, quality
export async function getOldPurchases(
  brandId?: number,
  categoryId?: number,
  typeId?: number,
  qualityId?: number
) {
  try {
    if (!brandId && !categoryId && !typeId && !qualityId) {
      return { success: true, data: [] };
    }

    const where: any = {};
    if (brandId) where.brandId = brandId;
    if (categoryId) where.categoryId = categoryId;
    if (typeId) where.typeId = typeId;
    if (qualityId) where.qualityId = qualityId;

    let oldPurchases = await prisma.trnPurchaseItem.findMany({
      where,
      include: {
        purchase: {
          include: {
            supplier: true,
          },
        },
        brand: true,
        category: true,
        type: true,
        quality: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    return { success: true, data: JSON.parse(JSON.stringify(oldPurchases)) };
  } catch (error) {
    console.error("Error fetching old purchases:", error);
    return { success: false, error: "Failed to fetch old purchases" };
  }
}

// Create purchase
export async function createPurchase(data: PurchaseFormData) {
  try {
    // Generate purchase code
    console.log("came here")
    const codeResult = await getNextPurchaseCode();
    if (!codeResult.success || !codeResult.purchaseCode) {
      return { success: false, error: "Failed to generate purchase code" };
    }

    // Get supplier details
    const supplierResult = await getSupplierById(data.supplierId);
    if (!supplierResult.success || !supplierResult.data) {
      return { success: false, error: "Supplier not found" };
    }

    const supplier = supplierResult.data;
    console.log("purchase category", data.purchaseCategory)

    // Create purchase with items
    const purchase = await prisma.trnPurchase.create({
      data: {
        purchaseCode: codeResult.purchaseCode,
        purchaseDate: data.purchaseDate,
        supplierId: data.supplierId,
        purchaseCategory: data.purchaseCategory, 
        gstNumber: supplier.gstNumber,
        mobileNumber: supplier.mobileNumber,
        subTotal: data.subTotal,
        sgst: data.sgst,
        cgst: data.cgst,
        igst: data.igst,
        totalTax: data.totalTax,
        freight: data.freight,
        roundOff: data.roundOff,
        nettAmount: data.nettAmount,
        remarks: data.remarks,
        createdBy: data.createdBy,
        items: {
          create: data.items.map((item) => ({
            brandId: item.brandId,
            categoryId: item.categoryId,
            typeId: item.typeId,
            qualityId: item.qualityId,
            purchaseQty: item.purchaseQty,
            purchaseAmount: item.purchaseAmount,
            purchaseRate: item.purchaseRate,
          })),
        },
      },
      include: {
        items: true,
        supplier: true,
      },
    });

    // Update counter
    await prisma.counter.update({
      where: { id: "PURCHASE" },
      data: { seq: codeResult.seq },
    });

    revalidatePath("/purchases");
    return { success: true, data: "done" };
  } catch (error) {
    console.error("Error creating purchase:", error);
    return { success: false, error: "Failed to create purchase" };
  }
}

// Get all purchases
export async function getPurchases() {
  try {
    const purchases = await prisma.trnPurchase.findMany({
      include: {
        supplier: true,
        items: {
          include: {
            brand: true,
            category: true,
            type: true,
            quality: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedData = purchases.map((purchase) => ({
      ...purchase,
      itemCount: purchase.items.length,
      subTotal: Number(purchase.subTotal),
      sgst: Number(purchase.sgst),
      cgst: Number(purchase.cgst),
      igst: Number(purchase.igst),
      totalTax: Number(purchase.totalTax),
      freight: Number(purchase.freight),
      roundOff: Number(purchase.roundOff),
      nettAmount: Number(purchase.nettAmount),
      items: purchase.items.map((item) => ({
        ...item,
        purchaseQty: Number(item.purchaseQty),
        purchaseAmount: Number(item.purchaseAmount),
        purchaseRate: Number(item.purchaseRate),
      })),
    }));


    return { success: true, data: serializedData };
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return { success: false, error: "Failed to fetch purchases" };
  }
}

// Delete purchase
export async function deletePurchase(id: number) {
  try {
    await prisma.trnPurchase.delete({
      where: { id },
    });

    revalidatePath("/purchases");
    return { success: true };
  } catch (error) {
    console.error("Error deleting purchase:", error);
    return { success: false, error: "Failed to delete purchase" };
  }
}
