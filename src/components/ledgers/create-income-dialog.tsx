// components/ledgers/create-income-dialog.tsx
'use client'

import { useState } from "react"
import { useToast } from "../ui/use-toast"
import { createIncome } from "@/actions/ledgers/actions"
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogFooter } from "../ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

export function CreateIncomeDialog({ open, onOpenChange, parents, setIncomes }: any) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [incomeName, setIncomeName] = useState("")
  const [parentId, setParentId] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!incomeName || !parentId) {
      toast({ title: "Error", description: "All fields required", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const res = await createIncome({
        incomeName,
        parentGroupId: parseInt(parentId),
      })

      if (res.success) {
        setIncomes((prev: any) => [...prev, res.data])
        onOpenChange(false)
        setIncomeName("")
        setParentId("")
        toast({ title: "Success", description: "Income created" })
      }
    } catch {
      toast({ title: "Error", description: "Failed", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Income</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Income Name"
              value={incomeName}
              onChange={(e) => setIncomeName(e.target.value)}
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
            <Button type="submit" disabled={isLoading}>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}