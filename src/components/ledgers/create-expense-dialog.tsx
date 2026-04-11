'use client'

import { useState } from "react";
import { useToast } from "../ui/use-toast";
import { createExpense } from "@/actions/ledgers/actions";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function CreateExpenseDialog({ open, onOpenChange, parents, setExpenses }: any) {
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [expenseName, setExpenseName] = useState("");
  const [parentId, setParentId] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!expenseName || !parentId) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await createExpense({
        expenseName,
        parentGroupId: parseInt(parentId),
      });

      if (res.success) {
        setExpenses((prev: any) => [...prev, res.data]);
        onOpenChange(false);
        setExpenseName("");
        setParentId("");

        toast({ title: "Success", description: "Expense created" });
      }
    } catch {
      toast({ title: "Error", description: "Failed", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Expense</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">

            <Input
              placeholder="Expense Name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
            />

            <Select value={parentId} onValueChange={setParentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Parent" />
              </SelectTrigger>
              <SelectContent>
                {parents.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}