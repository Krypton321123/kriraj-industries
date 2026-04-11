'use client'

import { useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deleteExpense } from "@/actions/ledgers/actions"



interface ExpenseTableProps {
  expenses: any[]
  parents: any[]
  setExpenses: (expenses: any[]) => void
}

export function ExpenseTable({ expenses, parents, setExpenses }: ExpenseTableProps) {
  const [selected, setSelected] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editParentId, setEditParentId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleEdit = (expense: any) => {
    setSelected(expense)
    setEditName(expense.expenseName)
    setEditParentId(String(expense.parentGroupId))
    setIsEditOpen(true)
  }

  const handleDelete = (expense: any) => {
    setSelected(expense)
    setIsDeleteOpen(true)
  }

  // Wire these up to your server actions once added to actions.ts
  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      // Replace with: await updateExpense(selected.id, { expenseName: editName, parentGroupId: Number(editParentId) })
      const res = await fetch("/api/expenses/" + selected.id, {
        method: "PATCH",
        body: JSON.stringify({ expenseName: editName, parentGroupId: Number(editParentId) }),
      })
      const newParent = parents.find((p) => p.id === Number(editParentId))
      setExpenses(
        expenses.map((e) =>
          e.id === selected.id
            ? { ...e, expenseName: editName, parentGroupId: Number(editParentId), parentGroup: newParent }
            : e
        )
      )
      setIsEditOpen(false)
      toast.success("Expense updated")
    } catch {
      toast.error("Failed to update expense — wire up the server action")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      // Replace with: await deleteExpense(selected.id)
      await deleteExpense(selected.id)
      setExpenses(expenses.filter((e) => e.id !== selected.id))
      setIsDeleteOpen(false)
      toast.success("Expense deleted")
    } catch {
      toast.error("Failed to delete expense — wire up the server action")
    } finally {
      setDeleting(false)
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
        <p className="text-sm text-gray-500">Add your first expense to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="font-medium text-gray-700">Code</TableHead>
              <TableHead className="font-medium text-gray-700">Name</TableHead>
              <TableHead className="font-medium text-gray-700">Parent Group</TableHead>
              <TableHead className="font-medium text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((exp) => (
              <TableRow key={exp.id} className="border-gray-200 hover:bg-gray-50/50">
                <TableCell className="font-mono text-sm">{exp.expenseCode}</TableCell>
                <TableCell className="font-medium">{exp.expenseName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {exp.parentGroup?.name ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(exp)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(exp)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-expense-name">Expense Name</Label>
              <Input
                id="edit-expense-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Expense name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-parent">Parent Group</Label>
              <Select value={editParentId} onValueChange={setEditParentId}>
                <SelectTrigger id="edit-parent">
                  <SelectValue placeholder="Select parent group" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((p) => (
                    <SelectItem key={p.id} value={String(p.id)}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selected?.expenseName}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}