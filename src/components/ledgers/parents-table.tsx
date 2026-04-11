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
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import { updateLedgerParent, deleteLedgerParent } from "@/actions/ledgers/actions"
import { toast } from "sonner"

interface ParentTableProps {
  parents: any[]
  setParents: (parents: any[]) => void
}

export function ParentTable({ parents, setParents }: ParentTableProps) {
  const [selected, setSelected] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleEdit = (parent: any) => {
    setSelected(parent)
    setEditName(parent.name)
    setIsEditOpen(true)
  }

  const handleDelete = (parent: any) => {
    setSelected(parent)
    setIsDeleteOpen(true)
  }

  const handleSave = async () => {
    if (!selected) return
    setSaving(true)
    const result = await updateLedgerParent(selected.id, { name: editName })
    setSaving(false)
    if (result.success) {
      setParents(parents.map((p) => p.id === selected.id ? { ...p, name: editName } : p))
      setIsEditOpen(false)
      toast.success("Parent group updated")
    } else {
      toast.error("Failed to update parent group")
    }
  }

  const handleConfirmDelete = async () => {
    if (!selected) return
    setDeleting(true)
    const result = await deleteLedgerParent(selected.id)
    setDeleting(false)
    if (result.success) {
      setParents(parents.filter((p) => p.id !== selected.id))
      setIsDeleteOpen(false)
      toast.success("Parent group deleted")
    } else {
      toast.error("Failed to delete parent group")
    }
  }

  if (parents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-1">No parent groups found</h3>
        <p className="text-sm text-gray-500">Create your first parent group to get started</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-200">
              <TableHead className="font-medium text-gray-700">Name</TableHead>
              <TableHead className="font-medium text-gray-700">System Ledger</TableHead>
              <TableHead className="font-medium text-gray-700">Ledgers</TableHead>
              <TableHead className="font-medium text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parents.map((parent) => (
              <TableRow key={parent.id} className="border-gray-200 hover:bg-gray-50/50">
                <TableCell className="font-medium">{parent.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {parent.systemLedger?.sysLedgerName ?? "—"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {parent._count?.generalLedgers ?? 0}
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
                      <DropdownMenuItem className="cursor-pointer" onClick={() => handleEdit(parent)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(parent)}
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
            <DialogTitle>Edit Parent Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Parent group name"
              />
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
            <AlertDialogTitle>Delete Parent Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selected?.name}</span>?
              This action cannot be undone and may affect associated ledgers.
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