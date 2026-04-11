import { PrismaClient } from "@/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // // ============================================
  // // Initialize Counter
  // // ============================================
  // const purchaseCounter = await prisma.counter.upsert({
  //   where: { id: "PURCHASE" },
  //   update: {},
  //   create: { id: "PURCHASE", seq: 0 },
  // });

  // console.log("✅ Counter initialized");

  // // ============================================
  // // Sample Suppliers
  // // ============================================
  // const suppliers = await prisma.mstSupplier.createMany({
  //   data: [
  //     {
  //       supplierCode: "SUP0001",
  //       supplierName: "Rajesh Electronics Pvt Ltd",
  //       supplierAddress: "Shop No. 45, Electronic Market, Sector 18",
  //       city: "Noida",
  //       state: "Uttar Pradesh",
  //       mobileNumber: "9876543210",
  //       openingBalance: "15000.00",
  //       createdBy: "ADMIN",
  //       gstNumber: "09AAAAA0000A1Z5",
  //       aadharNumber: "123456789012",
  //       panNumber: "ABCDE1234F",
  //       bankName: "HDFC Bank",
  //       bankBranch: "Noida Sector 18",
  //       accountNumber: "50100012345678",
  //       ifscCode: "HDFC0001234",
  //       status: "active",
  //     },
  //     {
  //       supplierCode: "SUP0002",
  //       supplierName: "Metro Traders",
  //       supplierAddress: "23/A, Industrial Area Phase 1",
  //       city: "Chandigarh",
  //       state: "Chandigarh",
  //       mobileNumber: "9876543211",
  //       openingBalance: "0.00",
  //       createdBy: "ADMIN",
  //       gstNumber: "04BBBBB0000B1Z5",
  //       aadharNumber: "234567890123",
  //       panNumber: "BCDEF2345G",
  //       bankName: "ICICI Bank",
  //       bankBranch: "Chandigarh Main",
  //       accountNumber: "60200012345678",
  //       ifscCode: "ICIC0002345",
  //       status: "active",
  //     },
  //     {
  //       supplierCode: "SUP0003",
  //       supplierName: "Premium Suppliers Co.",
  //       supplierAddress: "Building 12, Commercial Complex",
  //       city: "Lucknow",
  //       state: "Uttar Pradesh",
  //       mobileNumber: "9876543212",
  //       openingBalance: "25000.00",
  //       createdBy: "ADMIN",
  //       gstNumber: "09CCCCC0000C1Z5",
  //       aadharNumber: "345678901234",
  //       panNumber: "CDEFG3456H",
  //       bankName: "State Bank of India",
  //       bankBranch: "Hazratganj",
  //       accountNumber: "10300012345678",
  //       ifscCode: "SBIN0003456",
  //       status: "active",
  //     },
  //     {
  //       supplierCode: "SUP0004",
  //       supplierName: "National Distributors",
  //       supplierAddress: "Plot 78, Warehouse District",
  //       city: "Jaipur",
  //       state: "Rajasthan",
  //       mobileNumber: "9876543213",
  //       openingBalance: "5000.00",
  //       createdBy: "ADMIN",
  //       gstNumber: "08DDDDD0000D1Z5",
  //       aadharNumber: "456789012345",
  //       panNumber: "DEFGH4567I",
  //       bankName: "Axis Bank",
  //       bankBranch: "Jaipur Civil Lines",
  //       accountNumber: "91100012345678",
  //       ifscCode: "UTIB0004567",
  //       status: "active",
  //     },
  //     {
  //       supplierCode: "SUP0005",
  //       supplierName: "Global Imports Ltd",
  //       supplierAddress: "Tower B, Trade Center",
  //       city: "Mumbai",
  //       state: "Maharashtra",
  //       mobileNumber: "9876543214",
  //       openingBalance: "50000.00",
  //       createdBy: "ADMIN",
  //       gstNumber: "27EEEEE0000E1Z5",
  //       aadharNumber: "567890123456",
  //       panNumber: "EFGHI5678J",
  //       bankName: "Kotak Mahindra Bank",
  //       bankBranch: "Mumbai BKC",
  //       accountNumber: "81100012345678",
  //       ifscCode: "KKBK0005678",
  //       status: "active",
  //     },
  //   ],
  // });

  // console.log("✅ Suppliers inserted");

  // // ============================================
  // // Master Data (Brand / Category / Type / Quality)
  // // ============================================

  // await prisma.mstbrand.createMany({
  //   data: [
  //     { brandCode: "BM0001", brandName: "Samsung" },
  //     { brandCode: "BM0002", brandName: "LG" },
  //     { brandCode: "BM0003", brandName: "Sony" },
  //     { brandCode: "BM0004", brandName: "Panasonic" },
  //     { brandCode: "BM0005", brandName: "Whirlpool" },
  //     { brandCode: "BM0006", brandName: "Godrej" },
  //     { brandCode: "BM0007", brandName: "Voltas" },
  //     { brandCode: "BM0008", brandName: "Blue Star" },
  //     { brandCode: "BM0009", brandName: "Carrier" },
  //     { brandCode: "BM0010", brandName: "Daikin" },
  //   ],
  // });

  // await prisma.mstCategory.createMany({
  //   data: [
  //     { categoryCode: "CM0001", categoryName: "Air Conditioner" },
  //     { categoryCode: "CM0002", categoryName: "Refrigerator" },
  //     { categoryCode: "CM0003", categoryName: "Washing Machine" },
  //     { categoryCode: "CM0004", categoryName: "Television" },
  //     { categoryCode: "CM0005", categoryName: "Microwave" },
  //     { categoryCode: "CM0006", categoryName: "Water Purifier" },
  //     { categoryCode: "CM0007", categoryName: "Air Cooler" },
  //     { categoryCode: "CM0008", categoryName: "Mixer Grinder" },
  //     { categoryCode: "CM0009", categoryName: "Induction Cooktop" },
  //     { categoryCode: "CM0010", categoryName: "Ceiling Fan" },
  //   ],
  // });

  // await prisma.mstType.createMany({
  //   data: [
  //     { typeCode: "TM0001", typeName: "Split" },
  //     { typeCode: "TM0002", typeName: "Window" },
  //     { typeCode: "TM0003", typeName: "Inverter" },
  //     { typeCode: "TM0004", typeName: "Non-Inverter" },
  //     { typeCode: "TM0005", typeName: "Single Door" },
  //     { typeCode: "TM0006", typeName: "Double Door" },
  //     { typeCode: "TM0007", typeName: "Side by Side" },
  //     { typeCode: "TM0008", typeName: "Front Load" },
  //     { typeCode: "TM0009", typeName: "Top Load" },
  //     { typeCode: "TM0010", typeName: "Semi-Automatic" },
  //   ],
  // });

  // await prisma.mstQuality.createMany({
  //   data: [
  //     { qualityCode: "QM0001", qualityName: "Premium Plus" },
  //     { qualityCode: "QM0002", qualityName: "Premium" },
  //     { qualityCode: "QM0003", qualityName: "Standard Plus" },
  //     { qualityCode: "QM0004", qualityName: "Standard" },
  //     { qualityCode: "QM0005", qualityName: "Economy Plus" },
  //     { qualityCode: "QM0006", qualityName: "Economy" },
  //     { qualityCode: "QM0007", qualityName: "Basic Plus" },
  //     { qualityCode: "QM0008", qualityName: "Basic" },
  //     { qualityCode: "QM0009", qualityName: "Entry Level" },
  //     { qualityCode: "QM0010", qualityName: "Budget" },
  //   ],
  // });

  // console.log("✅ Master data inserted");

  // // ============================================
  // // Historical Purchases
  // // ============================================

  // const supplier1 = await prisma.mstSupplier.findUnique({
  //   where: { supplierCode: "SUP0001" },
  // });
  // const supplier2 = await prisma.mstSupplier.findUnique({
  //   where: { supplierCode: "SUP0002" },
  // });
  // const brand1 = await prisma.mstbrand.findUnique({
  //   where: { brandCode: "BM0001" },
  // });
  // const brand2 = await prisma.mstbrand.findUnique({
  //   where: { brandCode: "BM0002" },
  // });
  // const cat1 = await prisma.mstCategory.findUnique({
  //   where: { categoryCode: "CM0001" },
  // });
  // const cat2 = await prisma.mstCategory.findUnique({
  //   where: { categoryCode: "CM0002" },
  // });
  // const type1 = await prisma.mstType.findUnique({
  //   where: { typeCode: "TM0001" },
  // });
  // const type2 = await prisma.mstType.findUnique({
  //   where: { typeCode: "TM0003" },
  // });
  // const q1 = await prisma.mstQuality.findUnique({
  //   where: { qualityCode: "QM0001" },
  // });
  // const q2 = await prisma.mstQuality.findUnique({
  //   where: { qualityCode: "QM0002" },
  // });

  // await prisma.counter.update({
  //   where: { id: "PURCHASE" },
  //   data: { seq: 3 },
  // });

  // const p1 = await prisma.trnPurchase.create({
  //   data: {
  //     purchaseCode: "PUR0001",
  //     purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  //     supplierId: supplier1!.id,
  //     gstNumber: "09AAAAA0000A1Z5",
  //     mobileNumber: "9876543210",
  //     subTotal: 50000.0,
  //     sgst: 2500.0,
  //     cgst: 2500.0,
  //     igst: 0.0,
  //     totalTax: 5000.0,
  //     freight: 500.0,
  //     roundOff: 0.0,
  //     nettAmount: 55500.0,
  //     remarks: "Bulk purchase - Quarterly order",
  //     createdBy: "ADMIN",
  //     items: {
  //       create: [
  //         {
  //           brandId: brand1!.id,
  //           categoryId: cat1!.id,
  //           typeId: type1!.id,
  //           qualityId: q1!.id,
  //           purchaseQty: 10,
  //           purchaseAmount: 50000.0,
  //           purchaseRate: 5000.0,
  //         },
  //       ],
  //     },
  //   },
  // });

  // const p2 = await prisma.trnPurchase.create({
  //   data: {
  //     purchaseCode: "PUR0002",
  //     purchaseDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
  //     supplierId: supplier2!.id,
  //     gstNumber: "04BBBBB0000B1Z5",
  //     mobileNumber: "9876543211",
  //     subTotal: 75000.0,
  //     sgst: 3750.0,
  //     cgst: 3750.0,
  //     igst: 0.0,
  //     totalTax: 7500.0,
  //     freight: 1000.0,
  //     roundOff: -50.0,
  //     nettAmount: 83450.0,
  //     remarks: "Regular monthly purchase",
  //     createdBy: "ADMIN",
  //     items: {
  //       create: [
  //         {
  //           brandId: brand1!.id,
  //           categoryId: cat1!.id,
  //           typeId: type1!.id,
  //           qualityId: q1!.id,
  //           purchaseQty: 15,
  //           purchaseAmount: 72000.0,
  //           purchaseRate: 4800.0,
  //         },
  //         {
  //           brandId: brand2!.id,
  //           categoryId: cat2!.id,
  //           typeId: type2!.id,
  //           qualityId: q2!.id,
  //           purchaseQty: 5,
  //           purchaseAmount: 3000.0,
  //           purchaseRate: 600.0,
  //         },
  //       ],
  //     },
  //   },
  // });

  // const p3 = await prisma.trnPurchase.create({
  //   data: {
  //     purchaseCode: "PUR0003",
  //     purchaseDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  //     supplierId: supplier1!.id,
  //     gstNumber: "09AAAAA0000A1Z5",
  //     mobileNumber: "9876543210",
  //     subTotal: 32000.0,
  //     sgst: 1600.0,
  //     cgst: 1600.0,
  //     igst: 0.0,
  //     totalTax: 3200.0,
  //     freight: 300.0,
  //     roundOff: 0.0,
  //     nettAmount: 35500.0,
  //     remarks: "Emergency stock replenishment",
  //     createdBy: "ADMIN",
  //     items: {
  //       create: [
  //         {
  //           brandId: brand1!.id,
  //           categoryId: cat1!.id,
  //           typeId: type1!.id,
  //           qualityId: q1!.id,
  //           purchaseQty: 8,
  //           purchaseAmount: 40000.0,
  //           purchaseRate: 5000.0,
  //         },
  //       ],
  //     },
  //   },
  // });

  // ============================================
  // Tax Table Seed
  // ============================================

  await prisma.mstSalesType.create({
    data: {
      code: "FG", name: "Finished Goods"
    }
  })

  console.log("✅ SALES TYPE table seeded");

  console.log("✅ Historical purchases inserted");

  console.log("🎉 Seed data inserted successfully!");
}

async function fixSalesCounter() {
  // 1. Get max salesCode
  const lastSale = await prisma.trnSales.findFirst({
    orderBy: {
      salesCode: "desc", // works because padded
    },
  });

  let maxSeq = 0;

  if (lastSale?.salesCode) {
    const match = lastSale.salesCode.match(/\d+$/);
    if (match) {
      maxSeq = parseInt(match[0], 10);
    }
  }

  console.log("Max sales sequence found:", maxSeq);

  // 2. Upsert counter
  await prisma.counter.upsert({
    where: { id: "SALES" },
    update: { seq: maxSeq },
    create: {
      id: "SALES",
      seq: maxSeq,
    },
  });

  console.log("Counter updated to:", maxSeq);
}

const ledgerNames = [
  "BANK ACCOUNTS",
  "BANK OCC A/C",
  "BANK OD A/C",
  "BRANCH/DIVISIONS",
  "CAPITAL ACCOUNT",
  "CASH-IN-HAND",
  "CURRENT ASSETS",
  "CURRENT LIABILITIES",
  "DEPOSITS(ASSET)",
  "DIRECT EXPENSES",
  "DIRECT INCOMES",
  "DUTIES AND TAXES",
  "FIXED ASSETS",
  "INDIRECT EXPENSES",
  "INDIRECT INCOMES",
  "INVESTMENTS",
  "LOANS AND ADVANCES (ASSET)",
  "LOANS LIABILITY",
  "MISC. EXPENSES",
  "PROVISIONS",
  "PURCHASE ACCOUNTS",
  "SALES ACCOUNTS",
  "SECURED LOANS",
  "STOCK IN HAND",
  "SUNDRY CREDITORS",
  "SUNDRY DEBTORS",
  "SUSPENSE A/C",
  "UNSECURED LOANS",
  "TRANSPORTER A/C",
  "BROKER A/C",
  "SUNDRY CREDITORS FOR PACKING MATERIAL",
  "STAFF (PAYROLL)",
  "LOCATION",
];

async function seedSystemLedgers() {
  try {
    const data = ledgerNames.map((name, index) => ({
      rowId: `ROW${String(index + 1).padStart(3, "0")}`,
      sysLedgerCode: `SG${String(index + 1).padStart(3, "0")}`,
      sysLedgerName: name,
    }));

    await prisma.mstSystemLedgers.createMany({
      data,
    });

    console.log("✅ System ledgers seeded successfully");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}


seedSystemLedgers()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

// main()
//   .then(() => prisma.$disconnect())
//   .catch((e) => {
//     console.error(e);
//     prisma.$disconnect();
//     process.exit(1);
//   });
