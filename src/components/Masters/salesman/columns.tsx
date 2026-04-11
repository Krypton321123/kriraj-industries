"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Edit, Trash2 } from "lucide-react";
import { Salesman } from "@/actions/masters/salesman/actions";

export const columns: ColumnDef<Salesman>[] = [
  {
    accessorKey: "salesmanCode",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Salesman Code
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-mono">{row.getValue("salesmanCode")}</div>;
    },
  },
  {
    accessorKey: "salesmanName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Salesman Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "salesmanAddress",
    header: "Address",
    cell: ({ row }) => {
      const address = row.getValue("salesmanAddress") as string;
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
      const salesman = row.original;
      const { onEdit, onDelete } = table.options.meta as any;

      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit?.(salesman.salesmanCode)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete?.(salesman.salesmanCode)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];