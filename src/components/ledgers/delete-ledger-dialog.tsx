'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteGeneralLedger } from "@/actions/ledgers/actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface DeleteLedgerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger: any
}

export function DeleteLedgerDialog({ open, onOpenChange, ledger }: DeleteLedgerDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const result = await deleteGeneralLedger(ledger.id)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "General ledger deleted successfully",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete general ledger",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete General Ledger</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{ledger?.ledgerName}</strong> ({ledger?.ledgerCode})?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}