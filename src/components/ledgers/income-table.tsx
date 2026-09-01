// components/ledgers/income-table.tsx
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
import { updateIncome, deleteIncome } from "@/actions/ledgers/actions"

interface IncomeTableProps {
  incomes: any[]
  parents: any[]
  setIncomes: (incomes: any[]) => void
}

export function IncomeTable({ incomes, parents, setIncomes }: IncomeTableProps) {
  const [selected, setSelected] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editParentId, setEditParentId] = useState<string>("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleEdit = (income: any) => {
    setSelected(income)
    setEditName(income.incomeName)
    setEditParentId(String(income.parentGroupId))
    setIsEditOpen(true)
  }

  const handleDelete = (income: any) => {
    setSelected(income)
    setIsDeleteOpen(true)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await updateIncome(selected.id, {
        incomeName: editName,
        parentGroupId: Number(editParentId),
      })
      if (res.success) {
        const newParent = parents.find((p) => p.id === Number(editParentId))
        setIncomes(
          incomes.map((i) =>
            i.id === selected.id
              ? { ...i, incomeName: editName, parentGroupId: Number(editParentId), parentGroup: newParent }
              : i
          )
        )
        setIsEditOpen(false)
        toast.success("Income updated")
      } else {
        toast.error("Failed to update income")
      }
    } catch {
      toast.error("Failed to update income")
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selected) return
    setDeleting(true)
    try {
      const res = await deleteIncome(selected.id)
      if (res.success) {
        setIncomes(incomes.filter((i) => i.id !== selected.id))
        setIsDeleteOpen(false)
        toast.success("Income deleted")
      } else {
        toast.error("Failed to delete income")
      }
    } catch {
      toast.error("Failed to delete income")
    } finally {
      setDeleting(false)
    }
  }

  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">No incomes found</h3>
        <p className="text-sm text-gray-500">Add your first income to get started</p>
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
            {incomes.map((inc) => (
              <TableRow key={inc.id} className="border-gray-200 hover:bg-gray-50/50">
                <TableCell className="font-mono text-sm">{inc.incomeCode}</TableCell>
                <TableCell className="font-medium">{inc.incomeName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {inc.parentGroup?.name ?? "—"}
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
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(inc)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(inc)}
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
            <DialogTitle>Edit Income</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Income Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Income name"
              />
            </div>
            <div className="space-y-2">
              <Label>Parent Group</Label>
              <Select value={editParentId} onValueChange={setEditParentId}>
                <SelectTrigger>
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
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{selected?.incomeName}</span>?
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