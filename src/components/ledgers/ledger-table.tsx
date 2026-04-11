'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EditLedgerDialog } from "./edit-ledger-dialog"
import { DeleteLedgerDialog } from "./delete-ledger-dialog"
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface LedgerTableProps {
  ledgers: any[]
  parents: any[]
}

export function LedgerTable({ ledgers, parents }: LedgerTableProps) {
  const [selectedLedger, setSelectedLedger] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  console.log(ledgers); 

  const handleEdit = (ledger: any) => {
    setSelectedLedger(ledger)
    setIsEditOpen(true)
  }

  const handleDelete = (ledger: any) => {
    setSelectedLedger(ledger)
    setIsDeleteOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'suspended':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (ledgers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No ledgers found
          </h3>
          <p className="text-sm text-gray-500">
            Get started by creating your first general ledger
          </p>
        </div>
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
              <TableHead className="font-medium text-gray-700">Print Name</TableHead>
              <TableHead className="font-medium text-gray-700">Parent</TableHead>
              <TableHead className="font-medium text-gray-700">Opening Balance</TableHead>
              <TableHead className="font-medium text-gray-700">Status</TableHead>
              <TableHead className="font-medium text-gray-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ledgers.map((ledger) => (
              <TableRow key={ledger.id} className="border-gray-200 hover:bg-gray-50/50">
                <TableCell className="font-mono text-sm">
                  {ledger.ledgerCode}
                </TableCell>
                <TableCell className="font-medium">
                  {ledger.ledgerName}
                </TableCell>
                <TableCell className="font-medium">
                  {ledger.printName}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-normal">
                    {ledger.LedgerParent?.name}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono">
                  {formatCurrency(ledger.openingBalance)}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(ledger.status)} border font-medium`}
                  >
                    {ledger.status}
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
                      <DropdownMenuItem className="cursor-pointer">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => handleEdit(ledger)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer text-red-600 focus:text-red-600"
                        onClick={() => handleDelete(ledger)}
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

      {selectedLedger && (
        <>
          <EditLedgerDialog
            open={isEditOpen}
            onOpenChange={setIsEditOpen}
            ledger={selectedLedger}
            parents={parents}
          />
          <DeleteLedgerDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            ledger={selectedLedger}
          />
        </>
      )}
    </>
  )
}