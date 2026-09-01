"use client";

import { useEffect, useState, Suspense } from "react";
import {
  getExpenses,
  getGeneralLedgers,
  getIncomes,
  getLedgerParents,
} from "@/actions/ledgers/actions";
import { LedgerTable } from "@/components/ledgers/ledger-table";
import { LedgerHeader } from "@/components/ledgers/ledger-header";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ParentTable } from "@/components/ledgers/parents-table";
import { ExpenseTable } from "@/components/ledgers/expenses-table";
import { IncomeTable } from "@/components/ledgers/income-table";

export default function LedgersPage() {
  const [ledgers, setLedgers] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ledgersResult, parentsResult, expensesResult, incomesResult] =
          await Promise.all([
            getGeneralLedgers(),
            getLedgerParents(),
            getExpenses(),
            getIncomes(),
          ]);

        setLedgers(ledgersResult.success ? ledgersResult.data! : []);
        setParents(parentsResult.success ? parentsResult.data! : []);
        setExpenses(expensesResult.success ? expensesResult.data! : []);
        setIncomes(incomesResult.success ? incomesResult.data! : []);
      } catch (err) {
        console.error("Error fetching ledgers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <LedgerHeader
          setExpenses={setExpenses}
          setLedgers={setLedgers}
          parents={parents}
          setParents={setParents}
          setIncomes={setIncomes}
        />

        {loading ? (
          <Card className="mt-6 border-0 shadow-sm">
            <LoadingSkeleton />
          </Card>
        ) : (
          <Suspense fallback={<LoadingSkeleton />}>
            {/* General Ledgers — full width */}
            <Card className="mt-6 shadow-sm border-0">
              <h2 className="px-6 pt-5 pb-3 text-base font-semibold text-gray-800 border-b border-gray-100">
                General Ledgers
              </h2>
              <LedgerTable ledgers={ledgers} parents={parents} />
            </Card>

            {/* Parent Groups + Expenses — side by side */}
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm border-0">
                <h2 className="px-6 pt-5 pb-3 text-base font-semibold text-gray-800 border-b border-gray-100">
                  Parent Groups
                </h2>
                <ParentTable parents={parents} setParents={setParents} />
              </Card>

              <Card className="shadow-sm border-0">
                <h2 className="px-6 pt-5 pb-3 text-base font-semibold text-gray-800 border-b border-gray-100">
                  Expenses
                </h2>
                <ExpenseTable
                  expenses={expenses}
                  parents={parents}
                  setExpenses={setExpenses}
                />
              </Card>
              <Card className="shadow-sm border-0">
                <h2 className="px-6 pt-5 pb-3 text-base font-semibold text-gray-800 border-b border-gray-100">
                  Incomes
                </h2>
                <IncomeTable
                  incomes={incomes}
                  parents={parents}
                  setIncomes={setIncomes}
                />
              </Card>
            </div>
          </Suspense>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
      ))}
    </div>
  );
}
