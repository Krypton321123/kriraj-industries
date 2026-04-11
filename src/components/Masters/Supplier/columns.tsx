"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Supplier } from "@/actions/masters/supplier/actions";

export const columns: ColumnDef<Supplier>[] = [
  {
    accessorKey: "supplierCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-mono">{row.getValue("supplierCode")}</div>;
    },
  },
  {
    accessorKey: "supplierName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Supplier Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "supplierAddress",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("supplierAddress") as string;
      return (
        <div className="max-w-[200px] truncate" title={address}>
          {address}
        </div>
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "state",
    header: "State",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
  },
  {
    accessorKey: "openingBalance",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Opening Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("openingBalance"));
      const formatted = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "gstNumber",
    header: "GST Number",
  },
  {
    accessorKey: "panNumber",
    header: "PAN Number",
    cell: ({ row }) => {
      const pan = row.getValue("panNumber") as string;
      return pan ? <div className="font-mono text-sm">{pan}</div> : <span className="text-gray-400">-</span>;
    },
  },
  {
    accessorKey: "aadharNumber",
    header: "Aadhar Number",
    cell: ({ row }) => {
      const aadhar = row.getValue("aadharNumber") as string;
      return aadhar ? <div className="font-mono text-sm">{aadhar}</div> : <span className="text-gray-400">-</span>;
    },
  },
  {
    accessorKey: "bankName",
    header: "Bank Name",
    cell: ({ row }) => {
      const bank = row.getValue("bankName") as string;
      return bank || <span className="text-gray-400">-</span>;
    },
  },
  {
    accessorKey: "createdBy",
    header: "Created By",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return date.toLocaleDateString("en-IN");
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const supplier = row.original;
      const { onEdit, onDelete } = table.options.meta as any;

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(supplier.supplierCode)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(supplier.supplierCode)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];