'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/util/prisma'

async function generateNewLedgerCode() {
  const last = await prisma.generalLedgers.findFirst({
    select: { ledgerCode: true },
    orderBy: { id: 'desc' },
  });

  if (!last) {
    return "LG0001";
  }

  const num = parseInt(last.ledgerCode.replace("LG", "")) || 0;
  const newNumber = num + 1;
  const newCode = `LG${String(newNumber).padStart(4, "0")}`;

  return newCode;
}
export async function createGeneralLedger(data: {
  ledgerCode: string
  ledgerName: string
  status: string
  openingBalance: string
  ledgerParentId: number
  printName: string 
}) {
  try {
    
    const ledgerCode = await generateNewLedgerCode(); 

    const ledger = await prisma.generalLedgers.create({
      data: {
        ledgerCode: ledgerCode,
        ledgerName: data.ledgerName,
        status: data.status,
        openingBalance: data.openingBalance,
        ledgerP: data.ledgerParentId,
        printName: data.printName?.trim() || data.ledgerName
      },
      include: {
        LedgerParent: true,
      },
    })
    
    revalidatePath('/ledgers')
    return { success: true, data: ledger }
  } catch (error) {
    console.error('Error creating general ledger:', error)
    return { success: false, error: 'Failed to create general ledger' }
  }
}

export async function updateGeneralLedger(
  id: number,
  data: {
    ledgerCode: string
    ledgerName: string
    status: string
    openingBalance: string
    ledgerParentId: number
    printName: string 
  }
) {
  try {
    const ledger = await prisma.generalLedgers.update({
      where: { id },
      data: {
        ledgerCode: data.ledgerCode,
        ledgerName: data.ledgerName,
        status: data.status,
        openingBalance: data.openingBalance,
        ledgerP: data.ledgerParentId,
        printName: data.printName?.trim() || data.ledgerName
      },
      include: {
        LedgerParent: true,
      },
    })
    
    revalidatePath('/home/ledger')
    return { success: true, data: ledger }
  } catch (error) {
    console.error('Error updating general ledger:', error)
    return { success: false, error: 'Failed to update general ledger' }
  }
}

export async function deleteGeneralLedger(id: number) {
  try {
    await prisma.generalLedgers.delete({
      where: { id },
    })
    
    revalidatePath('/home/ledger')
    return { success: true }
  } catch (error) {
    console.error('Error deleting general ledger:', error)
    return { success: false, error: 'Failed to delete general ledger' }
  }
}

export async function getGeneralLedgers() {
  try {
    const ledgers = await prisma.generalLedgers.findMany({
      include: {
        LedgerParent: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    
    return { success: true, data: ledgers }
  } catch (error) {
    console.error('Error fetching general ledgers:', error)
    return { success: false, error: 'Failed to fetch general ledgers' }
  }
}

export async function getGeneralLedger(id: number) {
  try {
    const ledger = await prisma.generalLedgers.findUnique({
      where: { id },
      include: {
        LedgerParent: true,
      },
    })
    
    return { success: true, data: ledger }
  } catch (error) {
    console.error('Error fetching general ledger:', error)
    return { success: false, error: 'Failed to fetch general ledger' }
  }
}

// Ledger Parent Actions
export async function createLedgerParent(data: { name: string, systemLedgerId: string }) {
  try {
    const parent = await prisma.ledgerParent.create({
      data: {
        name: data.name, systemLedgerId: data.systemLedgerId
      },
    })
    
    revalidatePath('/home/ledger')
    return { success: true, data: parent }
  } catch (error) {
    console.error('Error creating ledger parent:', error)
    return { success: false, error: 'Failed to create ledger parent' }
  }
}

export async function updateLedgerParent(id: number, data: { name: string }) {
  try {
    const parent = await prisma.ledgerParent.update({
      where: { id },
      data: {
        name: data.name,
      },
    })
    
    revalidatePath('/home/ledger')
    return { success: true, data: parent }
  } catch (error) {
    console.error('Error updating ledger parent:', error)
    return { success: false, error: 'Failed to update ledger parent' }
  }
}

export async function deleteLedgerParent(id: number) {
  try {
    await prisma.ledgerParent.delete({
      where: { id },
    })
    
    revalidatePath('/home/ledger')
    return { success: true }
  } catch (error) {
    console.error('Error deleting ledger parent:', error)
    return { success: false, error: 'Failed to delete ledger parent' }
  }
}

export async function getLedgerParents() {
  try {
    const parents = await prisma.ledgerParent.findMany({
      include: {
        _count: {
          select: { generalLedgers: true },
        },
        systemLedger: true
      },
      orderBy: {
        name: 'asc',
      },
    })
    
    return { success: true, data: parents }
  } catch (error) {
    console.error('Error fetching ledger parents:', error)
    return { success: false, error: 'Failed to fetch ledger parents' }
  }
}

export async function getSystemLedgers() {
  const data = await prisma.mstSystemLedgers.findMany() 

  return {success: true, data}
}

async function generateNewExpenseCode() {
  const last = await prisma.mstExpenses.findFirst({
    select: { expenseCode: true },
    orderBy: { id: "desc" },
  });

  if (!last) return "EX0001";

  const num = parseInt(last.expenseCode.replace("EX", "")) || 0;
  const newNumber = num + 1;

  return `EX${String(newNumber).padStart(4, "0")}`;
}

export async function createExpense(data: {
  expenseName: string
  parentGroupId: number
}) {
  try {
    const expenseCode = await generateNewExpenseCode();

    const expense = await prisma.mstExpenses.create({
      data: {
        expenseCode,
        expenseName: data.expenseName,
        parentGroupId: data.parentGroupId,
      },
      include: {
        parentGroup: true,
      },
    });

    revalidatePath('/ledgers');
    return { success: true, data: expense };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function getExpenses() {
  try {
    const expenses = await prisma.mstExpenses.findMany({
      include: {
        parentGroup: true,
      },
      orderBy: { createdAt: "desc" }, 
    });

    return { success: true, data: expenses };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}

export async function updateExpense(
  id: string,
  data: { expenseName: string; parentGroupId: number }
) {
  try {
    const expense = await prisma.mstExpenses.update({
      where: { id },
      data: {
        expenseName: data.expenseName,
        parentGroupId: data.parentGroupId,
      },
      include: { parentGroup: true },
    });
 
    revalidatePath('/ledgers');
    return { success: true, data: expense };
  } catch (error) {
    console.error('Error updating expense:', error);
    return { success: false, error: 'Failed to update expense' };
  }
}
 
export async function deleteExpense(id: string) {
  try {
    await prisma.mstExpenses.delete({ where: { id } });
 
    revalidatePath('/ledgers');
    return { success: true };
  } catch (error) {
    console.error('Error deleting expense:', error);
    return { success: false, error: 'Failed to delete expense' };
  }
}
 