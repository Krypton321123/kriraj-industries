"use server";
import { prisma } from "@/util/prisma";

export const getCustomers = async () => {
  const data = await prisma.mstCustomer.findMany({
    where: { status: "active" },
    include: {
      salesman: true,
    },
    orderBy: { customerName: "asc" },
  });

  const res = data.map((item) => {
    return {
      ...item,
      openingBalance: Number(item.openingBalance),
    };
  });

  return res;
};

export const getRateListForCustomer = async (customerId: number) => {
  const data = await prisma.rateList.findUnique({
    where: { customerId },
    include: {
      columns: true,
      items: {
        include: {
          brand: true,
          category: true,
          type: true,
          quality: true,
          values: true,
        },
      },
    },
  });

  if (!data) return null;

  return {
    columns: data.columns,
    items: data.items.map((item) => ({
      brandId: item.brandId,
      brandName: item.brand.brandName,

      categoryId: item.categoryId,
      categoryName: item.category.categoryName,

      typeId: item.typeId,
      typeName: item.type.typeName,

      qualityId: item.qualityId,
      qualityName: item.quality.qualityName,
      nettRate: Number(item.nettRate) || 0,
      total: Number(item.total) || 0,

      values: item.values.map((v) => ({
        columnIndex: v.columnIndex,
        value: Number(v.value),
      })),
    })),
  };
};

export async function resolveRate({
  salesTypeCode,
  columns,
  item,
}: {
  salesTypeCode: string;
  columns: any[];
  item: any;
}) {
  if (salesTypeCode === "OT") return 0;

  let targetColumnIndex = -1;

  columns.forEach((col: any, index: number) => {
    if (
      (salesTypeCode === "FG" && col.taxId === "nettrate") ||
      (salesTypeCode === "ST" && col.taxId === "sticker") ||
      (salesTypeCode === "GL" && col.taxId === "glass")
    ) {
      targetColumnIndex = index;
    }
  });

  if (targetColumnIndex === -1) return 0;

  const val = item.values.find((v: any) => v.columnIndex === targetColumnIndex);

  return val ? Number(val.value) : 0;
}

export const createSale = async (data: any) => {
  return prisma.trnSales.create({
    data: {
      salesCode: data.salesCode,
      salesDate: data.salesDate,

      customerId: data.customerId,
      salesmanId: data.salesmanId,
      gstNumber: data.gstNumber,
      mobileNumber: data.mobileNumber,
      sgst: data.sgst,
      cgst: data.cgst,
      igst: data.igst,
      freight: data.freight,
      roundOff: data.roundOff,

      subTotal: data.subTotal,
      totalTax: data.totalTax,
      nettAmount: data.nettAmount,

      createdBy: data.createdBy,

      items: {
        create: data.items.map((item: any) => ({
          salesTypeId: item.salesTypeId,

          brandId: item.brandId,
          categoryId: item.categoryId,
          typeId: item.typeId,
          qualityId: item.qualityId,

          qty: item.qty,
          rate: item.rate,
          amount: item.amount,

          mrp: item.mrp,
          mrpDiff: item.mrpDiff,
          diffAmount: item.diffAmount,
        })),
      },
    },
  });
};

export const getOldSales = async (
  brandId?: number,
  categoryId?: number,
  typeId?: number,
  qualityId?: number,
) => {
  const where: any = {};

  if (brandId) where.brandId = brandId;
  if (categoryId) where.categoryId = categoryId;
  if (typeId) where.typeId = typeId;
  if (qualityId) where.qualityId = qualityId;

  const sales = await prisma.trnSalesItem.findMany({
    where,
    include: {
      sales: {
        include: {
          customer: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  const mapped = sales.map((item) => ({
    ...item,

    // ✅ Item level
    rate: Number(item.rate),
    amount: Number(item.amount),
    mrp: Number(item.mrp),
    mrpDiff: Number(item.mrpDiff),
    diffAmount: Number(item.diffAmount),
    qty: Number(item.qty),

    // ✅ Nested sales FIXED
    sales: item.sales
      ? {
          ...item.sales,

          subTotal: Number(item.sales.subTotal),
          sgst: Number(item.sales.sgst),
          cgst: Number(item.sales.cgst),
          igst: Number(item.sales.igst),
          totalTax: Number(item.sales.totalTax),
          freight: Number(item.sales.freight),
          roundOff: Number(item.sales.roundOff),
          nettAmount: Number(item.sales.nettAmount),

          // keep safe fields
          salesDate: item.sales.salesDate,
          customer: {
            ...item.sales.customer,
            openingBalance: Number(item.sales.customer.openingBalance),
          },
        }
      : null,
  }));

  return mapped;
};

export async function getSalesTypes() {
  try {
    const salesTypes = await prisma.mstSalesType.findMany({
      orderBy: { name: "asc" },
    });

    console.log("salestypes", salesTypes);
    return { success: true, data: salesTypes };
  } catch (err) {
    console.error("getSalesTypes error:", err);
    return { success: false, data: [] };
  }
}

export async function getNextSalesCode() {
  try {
    const counter = await prisma.counter.findUnique({
      where: { id: "SALES" }, // 🔁 different key
    });

    let nextSeq = 1;

    if (counter) {
      nextSeq = counter.seq + 1;
    } else {
      await prisma.counter.create({
        data: {
          id: "SALES",
          seq: 1,
        },
      });
    }

    const salesCode = `SALE${String(nextSeq).padStart(5, "0")}`;

    return { success: true, salesCode, seq: nextSeq };
  } catch (error) {
    console.error("Error generating sales code:", error);
    return { success: false, error: "Failed to generate sales code" };
  }
}

export async function getSalesRecords() {
  try {
    const records = await prisma.trnSales.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        salesman: true,
        items: {
          include: {
            brand: true,
            category: true,
            type: true,
            quality: true,
            salesType: true,
          },
        },
      },
    });

    const mapped = records.map((r) => ({
      id: r.id,
      salesCode: r.salesCode,
      salesDate: r.salesDate,
      customer: {
        id: r.customer.id,
        customerCode: r.customer.customerCode,
        customerName: r.customer.customerName,
        customerAddress: r.customer.customerAddress,
        city: r.customer.city,
        state: r.customer.state,
        mobileNumber: r.customer.mobileNumber,
        gstNumber: r.customer.gstNumber,
        openingBalance: r.customer.openingBalance.toString(),
      },
      salesman: r.salesman
        ? {
            id: r.salesman.id,
            salesmanCode: r.salesman.salesmanCode,
            salesmanName: r.salesman.salesmanName,
          }
        : undefined,
      subTotal: Number(r.subTotal),
      totalTax: Number(r.totalTax),
      nettAmount: Number(r.nettAmount),
      remarks: r.remarks ?? "",
      createdBy: r.createdBy,
      itemCount: r.items.length,
      items: r.items.map((item) => ({
        id: item.id,
        brand: item.brand ? { brandName: item.brand.brandName } : undefined,
        category: item.category
          ? { categoryName: item.category.categoryName }
          : undefined,
        type: item.type ? { typeName: item.type.typeName } : undefined,
        quality: item.quality
          ? { qualityName: item.quality.qualityName }
          : undefined,
        salesType: item.salesType
          ? { id: item.salesType.id, name: item.salesType.name }
          : undefined,
        qty: Number(item.qty),
        rate: Number(item.rate),
        amount: Number(item.amount),
        mrp: Number(item.mrp),
        mrpDiff: Number(item.mrpDiff),
        diffAmount: Number(item.diffAmount),
      })),
    }));

    return { success: true, data: mapped };
  } catch (err) {
    console.error("getSalesRecords error:", err);
    return { success: false, data: [] };
  }
}

export async function getSalesById(salesCode: string) {
  const sale = await prisma.trnSales.findUnique({
    where: { salesCode },
    include: {
      items: {
        include: {
          brand: true,
          category: true,
          type: true,
          quality: true,
          salesType: true,
        },
      },
      customer: {
        include: { salesman: true },
      },
      salesman: true,
    },
  });

  if (!sale) return null;

  return {
    ...sale,
    subTotal: Number(sale.subTotal),
    sgst: Number(sale.sgst),
    cgst: Number(sale.cgst),
    igst: Number(sale.igst),
    freight: Number(sale.freight),
    roundOff: Number(sale.roundOff),
    nettAmount: Number(sale.nettAmount),
    totalTax: Number(sale.totalTax),
    items: sale.items.map((item) => ({
      // ✅ tempId is critical for controlled selects in the form
      tempId: item.id.toString(),
      id: item.id,
      salesTypeId: item.salesTypeId,
      salesTypeCode: item.salesType?.code,
      brandId: item.brandId,
      categoryId: item.categoryId,
      typeId: item.typeId,
      qualityId: item.qualityId,
      qty: Number(item.qty),
      rate: Number(item.rate),
      amount: Number(item.amount),
      mrp: Number(item.mrp),
      mrpDiff: Number(item.mrpDiff),
      diffAmount: Number(item.diffAmount),
    })),
  };
}

export async function updateSale(salesCode: string, data: any) {
  try {
    console.log("salescode", salesCode); 
    const existing = await prisma.trnSales.findUnique({
      where: { salesCode },
    });

    if (!existing) throw new Error("Sale not found");

    const updated = await prisma.trnSales.update({
      where: { salesCode },
      data: {
        salesDate: data.salesDate,
        customerId: data.customerId,
        salesmanId: data.salesmanId,
        gstNumber: data.gstNumber,
        mobileNumber: data.mobileNumber,
        sgst: data.sgst,
        cgst: data.cgst,
        igst: data.igst,
        freight: data.freight,
        roundOff: data.roundOff,
        subTotal: data.subTotal,
        totalTax: data.totalTax,
        nettAmount: data.nettAmount,

        // delete old items and recreate — safest with Prisma
        items: {
          deleteMany: {},
          create: data.items.map((item: any) => ({
            salesTypeId: item.salesTypeId,
            brandId: item.brandId,
            categoryId: item.categoryId,
            typeId: item.typeId,
            qualityId: item.qualityId,
            qty: item.qty,
            rate: item.rate,
            amount: item.amount,
            mrp: item.mrp,
            mrpDiff: item.mrpDiff,
            diffAmount: item.diffAmount,
          })),
        },
      },
    });

    return { success: true, data: updated };
  } catch (err) {
    console.error("updateSale error:", err);
    return { success: false, error: "Failed to update sale" };
  }
}
