"use server";
import { prisma } from "@/util/prisma";

// ─── SYSTEM LEDGER CODES ────────────────────────────────────────────────────
const CASH_SYSTEM_LEDGER_NAME = "CASH-IN-HAND";
const BANK_SYSTEM_LEDGER_NAME = "BANK ACCOUNTS";

// ─── GET LEDGERS BY PAYMENT MODE ────────────────────────────────────────────
export async function getLedgersByMode(mode: "CASH" | "BANK") {
  const sysLedgerName =
    mode === "CASH" ? CASH_SYSTEM_LEDGER_NAME : BANK_SYSTEM_LEDGER_NAME;

  // 1. Find the system ledger by name
  const systemLedger = await prisma.mstSystemLedgers.findFirst({
    where: { sysLedgerName },
  });

  if (!systemLedger) return [];

  // 2. Find all ledgerParents linked to this system ledger
  const parents = await prisma.ledgerParent.findMany({
    where: { systemLedgerId: systemLedger.id },
    include: {
      generalLedgers: true,
    },
  });

  // 3. Flatten all general ledgers under those parents
  const ledgers = parents.flatMap((p) =>
    p.generalLedgers.map((gl) => ({
      id: gl.id,
      ledgerCode: gl.ledgerCode,
      ledgerName: gl.ledgerName,
      parentName: p.name,
    }))
  );

  return ledgers;
}

// ─── GET ALL EXPENSES ────────────────────────────────────────────────────────
export async function getExpenses() {
  const expenses = await prisma.mstExpenses.findMany({
    include: {
      parentGroup: {
        include: {
          generalLedgers: true,
        },
      },
    },
    orderBy: { expenseName: "asc" },
  });

  const data = expenses.map((e) => ({
    id: e.id,
    expenseCode: e.expenseCode,
    expenseName: e.expenseName,
    parentGroupId: e.parentGroupId,
    // The receipt ledgers are the generalLedgers under the same parent group
    receiptLedgers: e.parentGroup.generalLedgers.map((gl) => ({
      id: gl.id,
      ledgerCode: gl.ledgerCode,
      ledgerName: gl.ledgerName,
    })),
  }));

  console.log("Expenses backend", data)

  return data; 
}

// ─── GET NEXT PAYMENT CODE ───────────────────────────────────────────────────
export async function getNextPaymentCode() {
  try {
    const counter = await prisma.counter.findUnique({
      where: { id: "PAYMENT" },
    });

    let nextSeq = 1;

    if (counter) {
      nextSeq = counter.seq + 1;
    } else {
      await prisma.counter.create({
        data: { id: "PAYMENT", seq: 1 },
      });
    }

    const paymentCode = `PAY${String(nextSeq).padStart(5, "0")}`;
    return { success: true, paymentCode, seq: nextSeq };
  } catch (error) {
    console.error("Error generating payment code:", error);
    return { success: false, error: "Failed to generate payment code" };
  }
}

// ─── CREATE PAYMENT ──────────────────────────────────────────────────────────
export async function createPayment(data: any) {
  try {
    // Increment counter
    await prisma.counter.upsert({
      where: { id: "PAYMENT" },
      update: { seq: { increment: 1 } },
      create: { id: "PAYMENT", seq: 1 },
    });

    const payment = await prisma.trnPayment.create({
      data: {
        paymentCode: data.paymentCode,
        paymentDate: data.paymentDate,
        paymentMode: data.paymentMode,
        paymentLedgerId: data.paymentLedgerId,
        totalAmount: data.totalAmount,
        remarks: data.remarks || "",
        createdBy: data.createdBy || "ADMIN",
        items: {
          create: data.items.map((item: any) => ({
            expenseId: item.expenseId,
            receiptLedgerId: item.receiptLedgerId,
            amount: item.amount,
            remarks: item.remarks || "",
          })),
        },
      },
    });

    return { success: true, data: payment };
  } catch (err) {
    console.error("createPayment error:", err);
    return { success: false, error: "Failed to create payment" };
  }
}

// ─── UPDATE PAYMENT ──────────────────────────────────────────────────────────
export async function updatePayment(paymentCode: string, data: any) {
  try {
    const existing = await prisma.trnPayment.findUnique({
      where: { paymentCode },
    });

    if (!existing) throw new Error("Payment not found");

    const updated = await prisma.trnPayment.update({
      where: { paymentCode },
      data: {
        paymentDate: data.paymentDate,
        paymentMode: data.paymentMode,
        paymentLedgerId: data.paymentLedgerId,
        totalAmount: data.totalAmount,
        remarks: data.remarks || "",
        items: {
          deleteMany: {},
          create: data.items.map((item: any) => ({
            expenseId: item.expenseId,
            receiptLedgerId: item.receiptLedgerId,
            amount: item.amount,
            remarks: item.remarks || "",
          })),
        },
      },
    });

    return { success: true, data: updated };
  } catch (err) {
    console.error("updatePayment error:", err);
    return { success: false, error: "Failed to update payment" };
  }
}

// ─── GET ALL PAYMENTS (SEARCH VIEW) ─────────────────────────────────────────
export async function getPaymentRecords() {
  try {
    const records = await prisma.trnPayment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        paymentLedger: true,
        items: {
          include: {
            expense: true,
            receiptLedger: true,
          },
        },
      },
    });

    return {
      success: true,
      data: records.map((r) => ({
        id: r.id,
        paymentCode: r.paymentCode,
        paymentDate: r.paymentDate,
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
          expense: {
            id: item.expense.id,
            expenseName: item.expense.expenseName,
            expenseCode: item.expense.expenseCode,
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
    console.error("getPaymentRecords error:", err);
    return { success: false, data: [] };
  }
}

// ─── GET PAYMENT BY CODE ─────────────────────────────────────────────────────
export async function getPaymentByCode(paymentCode: string) {
  const payment = await prisma.trnPayment.findUnique({
    where: { paymentCode },
    include: {
      paymentLedger: true,
      items: {
        include: {
          expense: {
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

  if (!payment) return null;

  return {
    id: payment.id,
    paymentCode: payment.paymentCode,
    paymentDate: payment.paymentDate,
    paymentMode: payment.paymentMode,
    paymentLedgerId: payment.paymentLedgerId,
    paymentLedger: {
      id: payment.paymentLedger.id,
      ledgerName: payment.paymentLedger.ledgerName,
    },
    totalAmount: Number(payment.totalAmount),
    remarks: payment.remarks ?? "",
    createdBy: payment.createdBy,
    items: payment.items.map((item) => ({
      tempId: item.id.toString(),
      id: item.id,
      expenseId: item.expenseId,
      expenseName: item.expense.expenseName,
      receiptLedgerId: item.receiptLedgerId,
      receiptLedgerName: item.receiptLedger.ledgerName,
      receiptLedgers: item.expense.parentGroup.generalLedgers.map((gl) => ({
        id: gl.id,
        ledgerName: gl.ledgerName,
      })),
      amount: Number(item.amount),
      remarks: item.remarks ?? "",
    })),
  };
}