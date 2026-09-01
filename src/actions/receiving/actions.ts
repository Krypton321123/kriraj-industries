"use server";
import { prisma } from "@/util/prisma";

const CASH_SYSTEM_LEDGER_NAME = "CASH-IN-HAND";
const BANK_SYSTEM_LEDGER_NAME = "BANK ACCOUNTS";

// ─── GET LEDGERS BY PAYMENT MODE ────────────────────────────────────────────
export async function getLedgersByMode(mode: "CASH" | "BANK") {
  const sysLedgerName =
    mode === "CASH" ? CASH_SYSTEM_LEDGER_NAME : BANK_SYSTEM_LEDGER_NAME;

  const systemLedger = await prisma.mstSystemLedgers.findFirst({
    where: { sysLedgerName },
  });

  if (!systemLedger) return [];

  const parents = await prisma.ledgerParent.findMany({
    where: { systemLedgerId: systemLedger.id },
    include: { generalLedgers: true },
  });

  return parents.flatMap((p) =>
    p.generalLedgers.map((gl) => ({
      id: gl.id,
      ledgerCode: gl.ledgerCode,
      ledgerName: gl.ledgerName,
      parentName: p.name,
    }))
  );
}

// ─── GET ALL INCOMES ─────────────────────────────────────────────────────────
export async function getIncomes() {
  const incomes = await prisma.mstIncome.findMany({
    include: {
      parentGroup: {
        include: { generalLedgers: true },
      },
    },
    orderBy: { incomeName: "asc" },
  });

  return incomes.map((i) => ({
    id: i.id,
    incomeCode: i.incomeCode,
    incomeName: i.incomeName,
    parentGroupId: i.parentGroupId,
    receiptLedgers: i.parentGroup.generalLedgers.map((gl) => ({
      id: gl.id,
      ledgerCode: gl.ledgerCode,
      ledgerName: gl.ledgerName,
    })),
  }));
}

// ─── GET NEXT RECEIVING CODE ─────────────────────────────────────────────────
export async function getNextReceivingCode() {
  try {
    const counter = await prisma.counter.findUnique({
      where: { id: "RECEIVING" },
    });

    let nextSeq = 1;

    if (counter) {
      nextSeq = counter.seq + 1;
    } else {
      await prisma.counter.create({
        data: { id: "RECEIVING", seq: 1 },
      });
    }

    const receivingCode = `REC${String(nextSeq).padStart(5, "0")}`;
    return { success: true, receivingCode, seq: nextSeq };
  } catch (error) {
    console.error("Error generating receiving code:", error);
    return { success: false, error: "Failed to generate receiving code" };
  }
}

// ─── CREATE RECEIVING ────────────────────────────────────────────────────────
export async function createReceiving(data: any) {
  try {
    await prisma.counter.upsert({
      where: { id: "RECEIVING" },
      update: { seq: { increment: 1 } },
      create: { id: "RECEIVING", seq: 1 },
    });

    const receiving = await prisma.trnReceiving.create({
      data: {
        receivingCode: data.receivingCode,
        receivingDate: data.receivingDate,
        paymentMode: data.paymentMode,
        paymentLedgerId: data.paymentLedgerId,
        totalAmount: data.totalAmount,
        remarks: data.remarks || "",
        createdBy: data.createdBy || "ADMIN",
        items: {
          create: data.items.map((item: any) => ({
            incomeId: item.incomeId,
            receiptLedgerId: item.receiptLedgerId,
            amount: item.amount,
            remarks: item.remarks || "",
          })),
        },
      },
    });

    return { success: true, data: receiving };
  } catch (err) {
    console.error("createReceiving error:", err);
    return { success: false, error: "Failed to create receiving" };
  }
}

// ─── UPDATE RECEIVING ────────────────────────────────────────────────────────
export async function updateReceiving(receivingCode: string, data: any) {
  try {
    const existing = await prisma.trnReceiving.findUnique({
      where: { receivingCode },
    });

    if (!existing) throw new Error("Receiving record not found");

    const updated = await prisma.trnReceiving.update({
      where: { receivingCode },
      data: {
        receivingDate: data.receivingDate,
        paymentMode: data.paymentMode,
        paymentLedgerId: data.paymentLedgerId,
        totalAmount: data.totalAmount,
        remarks: data.remarks || "",
        items: {
          deleteMany: {},
          create: data.items.map((item: any) => ({
            incomeId: item.incomeId,
            receiptLedgerId: item.receiptLedgerId,
            amount: item.amount,
            remarks: item.remarks || "",
          })),
        },
      },
    });

    return { success: true, data: updated };
  } catch (err) {
    console.error("updateReceiving error:", err);
    return { success: false, error: "Failed to update receiving" };
  }
}

// ─── GET ALL RECEIVINGS (SEARCH VIEW) ───────────────────────────────────────
export async function getReceivingRecords() {
  try {
    const records = await prisma.trnReceiving.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        paymentLedger: true,
        items: {
          include: {
            income: true,
            receiptLedger: true,
          },
        },
      },
    });

    return {
      success: true,
      data: records.map((r) => ({
        id: r.id,
        receivingCode: r.receivingCode,
        receivingDate: r.receivingDate,
        paymentMode: r.paymentMode,
        paymentLedger: {
          id: r.paymentLedger.id,
          ledgerName: r.paymentLedger.ledgerName,
        },
        totalAmount: Number(r.totalAmount),
        remarks: r.remarks ?? "",
        createdBy: r.createdBy,
        itemCount: r.items.length,
        items: r.items.map((item) => ({
          id: item.id,
          income: {
            id: item.income.id,
            incomeName: item.income.incomeName,
            incomeCode: item.income.incomeCode,
          },
          receiptLedger: {
            id: item.receiptLedger.id,
            ledgerName: item.receiptLedger.ledgerName,
          },
          amount: Number(item.amount),
          remarks: item.remarks ?? "",
        })),
      })),
    };
  } catch (err) {
    console.error("getReceivingRecords error:", err);
    return { success: false, data: [] };
  }
}

// ─── GET RECEIVING BY CODE ───────────────────────────────────────────────────
export async function getReceivingByCode(receivingCode: string) {
  const receiving = await prisma.trnReceiving.findUnique({
    where: { receivingCode },
    include: {
      paymentLedger: true,
      items: {
        include: {
          income: {
            include: {
              parentGroup: {
                include: { generalLedgers: true },
              },
            },
          },
          receiptLedger: true,
        },
      },
    },
  });

  if (!receiving) return null;

  return {
    id: receiving.id,
    receivingCode: receiving.receivingCode,
    receivingDate: receiving.receivingDate,
    paymentMode: receiving.paymentMode,
    paymentLedgerId: receiving.paymentLedgerId,
    paymentLedger: {
      id: receiving.paymentLedger.id,
      ledgerName: receiving.paymentLedger.ledgerName,
    },
    totalAmount: Number(receiving.totalAmount),
    remarks: receiving.remarks ?? "",
    createdBy: receiving.createdBy,
    items: receiving.items.map((item) => ({
      tempId: item.id.toString(),
      id: item.id,
      incomeId: item.incomeId.toString(),
      incomeName: item.income.incomeName,
      receiptLedgerId: item.receiptLedgerId,
      receiptLedgerName: item.receiptLedger.ledgerName,
      receiptLedgers: item.income.parentGroup.generalLedgers.map((gl) => ({
        id: gl.id,
        ledgerName: gl.ledgerName,
      })),
      amount: Number(item.amount),
      remarks: item.remarks ?? "",
    })),
  };
}