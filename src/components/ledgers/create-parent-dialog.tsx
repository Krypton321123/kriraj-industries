'use client'

import { useEffect, useState } from "react"
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

import { createLedgerParent, getSystemLedgers } from "@/actions/ledgers/actions"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface CreateParentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  setParents: any
}

export function CreateParentDialog({ open, onOpenChange, setParents }: CreateParentDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState("")
  const [systemLedgerId, setSystemLedgerId] = useState("")
  const [systemLedgers, setSystemLedgers] = useState<any[]>([])

  // 🔹 Fetch system ledgers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSystemLedgers()
        console.log("response", res)
        if (res.success) {
          setSystemLedgers(res.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (open) fetchData()
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a parent group name",
        variant: "destructive",
      })
      return
    }

    if (!systemLedgerId) {
      toast({
        title: "Error",
        description: "Please select a system ledger",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await createLedgerParent({
        name: name.trim(),
        systemLedgerId, 
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Parent group created successfully",
        })
        onOpenChange(false)
        setName("")
        setSystemLedgerId("")
        setParents((prev: any) => [...prev, result.data])
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create parent group",
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
            <DialogTitle>Create Parent Group</DialogTitle>
            <DialogDescription>
              Add a new parent group for organizing your general ledgers
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">

            {/* 🔹 Parent Name */}
            <div className="grid gap-2">
              <Label htmlFor="parentName">Parent Group Name</Label>
              <Input
                id="parentName"
                placeholder="e.g., Assets, Liabilities, Revenue"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            {/* 🔹 System Ledger Select */}
            <div className="grid gap-2">
              <Label>System Ledger</Label>
              <Select
                value={systemLedgerId}
                onValueChange={setSystemLedgerId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system ledger" />
                </SelectTrigger>
                <SelectContent>
                  {systemLedgers.map((ledger) => (
                    <SelectItem key={ledger.id} value={ledger.id}>
                      {ledger.sysLedgerName}
                    </SelectItem>
                  ))}
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
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Parent Group
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}