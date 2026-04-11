'use client'

import { useState } from "react"
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
import { createGeneralLedger } from "@/actions/ledgers/actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CreateLedgerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parents: any[]
  setLedgers: any
}

export function CreateLedgerDialog({ open, onOpenChange, parents, setLedgers }: CreateLedgerDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ledgerCode: "NEW",
    ledgerName: "",
    status: "active",
    openingBalance: "0",
    ledgerParentId: "",
    printName: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.ledgerParentId) {
      toast({
        title: "Error",
        description: "Please select a parent group",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    
    try {
      const result = await createGeneralLedger({
        ...formData,
        ledgerParentId: parseInt(formData.ledgerParentId),
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: "General ledger created successfully",
        })
        onOpenChange(false)
        setLedgers((prev: any) => [...prev, result.data]); 
        setFormData({
          ledgerCode: "NEW",
          ledgerName: "",
          status: "active",
          openingBalance: "0",
          ledgerParentId: "",
          printName: ""
        })
        
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create general ledger",
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
            <DialogTitle>Create New Ledger</DialogTitle>
            <DialogDescription>
              Add a new general ledger to your chart of accounts
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ledgerCode">Ledger Code</Label>
              <Input
                id="ledgerCode"
                placeholder=""
                value={formData.ledgerCode}
                onChange={(e) => setFormData({ ...formData, ledgerCode: e.target.value })}
                required
                disabled={true}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ledgerName">Ledger Name</Label>
              <Input
                id="ledgerName"
                placeholder="e.g., Cash in Bank"
                value={formData.ledgerName}
                onChange={(e) => setFormData({ ...formData, ledgerName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ledgerprint">Ledger Name</Label>
              <Input
                id="ledgerprint"
                placeholder="e.g., COB"
                value={formData.printName}
                onChange={(e) => setFormData({ ...formData, printName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="parent">Parent Group</Label>
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
              <Label htmlFor="openingBalance">Opening Balance</Label>
              <Input
                id="openingBalance"
                type="text"
                placeholder="0.00"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
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
              Create Ledger
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}