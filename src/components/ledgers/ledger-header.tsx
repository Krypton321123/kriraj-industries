"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateLedgerDialog } from "./create-ledger-dialog";
import { CreateParentDialog } from "./create-parent-dialog";
import { PlusCircle, Search, FolderPlus } from "lucide-react";
import { CreateExpenseDialog } from "./create-expense-dialog";

interface LedgerHeaderProps {
  parents: any[];
  setParents: any;
  setLedgers: any;
  setExpenses: any; 
}

export function LedgerHeader({
  parents,
  setParents,
  setLedgers,
  setExpenses
}: LedgerHeaderProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateLedgerOpen, setIsCreateLedgerOpen] = useState(false);
  const [isCreateParentOpen, setIsCreateParentOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            General Ledgers
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your chart of accounts and ledger hierarchy
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateParentOpen(true)}
            className="border-gray-200 hover:bg-gray-50"
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Parent Group
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateLedgerOpen(true)}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Ledger
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateExpenseOpen(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Expense
          </Button>
        </div>
      </div>

      <div className="mt-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search ledgers by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-gray-200 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <CreateLedgerDialog
        open={isCreateLedgerOpen}
        onOpenChange={setIsCreateLedgerOpen}
        parents={parents}
        setLedgers={setLedgers}
      />

      <CreateParentDialog
        open={isCreateParentOpen}
        onOpenChange={setIsCreateParentOpen}
        setParents={setParents}
      />
      <CreateExpenseDialog
        open={isCreateExpenseOpen}
        onOpenChange={setIsCreateExpenseOpen}
        parents={parents}
        setExpenses={setExpenses}
      />
    </>
  );
}
