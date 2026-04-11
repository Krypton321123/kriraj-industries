'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { updateGeneralLedger } from "@/actions/ledgers/actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface EditLedgerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ledger: any
  parents: any[]
}

export function EditLedgerDialog({ open, onOpenChange, ledger, parents }: EditLedgerDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ledgerCode: "",
    ledgerName: "",
    status: "",
    openingBalance: "",
    ledgerParentId: "",
    printName: ""
  })

  useEffect(() => {
    if (ledger) {
      setFormData({
        ledgerCode: ledger.ledgerCode,
        ledgerName: ledger.ledgerName,
        status: ledger.status,
        openingBalance: ledger.openingBalance,
        ledgerParentId: ledger.ledgerP.toString(),
        printName: ledger.printName
      })
    }
  }, [ledger])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    
    try {
      const result = await updateGeneralLedger(ledger.id, {
        ...formData,
        ledgerParentId: parseInt(formData.ledgerParentId),
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "General ledger updated successfully",
        })
        onOpenChange(false)
        router.refresh()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update general ledger",
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
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Ledger</DialogTitle>
            <DialogDescription>
              Update the general ledger information
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-ledgerCode">Ledger Code</Label>
              <Input
                id="edit-ledgerCode"
                placeholder="e.g., 1000"
                value={formData.ledgerCode}
                onChange={(e) => setFormData({ ...formData, ledgerCode: e.target.value })}
                required
                disabled={true}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-ledgerName">Ledger Name</Label>
              <Input
                id="edit-ledgerName"
                placeholder="e.g., Cash in Bank"
                value={formData.ledgerName}
                onChange={(e) => setFormData({ ...formData, ledgerName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ledgerprint">Ledger Name</Label>
              <Input
                id="edit-ledgerprint"
                placeholder="print name..."
                value={formData.printName}
                onChange={(e) => setFormData({ ...formData, printName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-parent">Parent Group</Label>
              <Select
                value={formData.ledgerParentId}
                onValueChange={(value) => setFormData({ ...formData, ledgerParentId: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a parent group" />
                </SelectTrigger>
                <SelectContent>
                  {parents.map((parent) => (
                    <SelectItem key={parent.id} value={parent.id.toString()}>
                      {parent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-openingBalance">Opening Balance</Label>
              <Input
                id="edit-openingBalance"
                type="text"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Ledger
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}