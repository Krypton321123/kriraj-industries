"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Customer = {
  id: number;
  customerCode: string;
  customerName: string;
  customerAddress: string;
  city: string;
  state: string;
  mobileNumber: string;
  gstNumber: string;
};

type ComboboxCustomerProps = {
  data: Customer[];
  setSelected: (value: string) => void;
  selectedId: number;
};

export default function ComboboxCustomer({
  data,
  setSelected,
  selectedId,
}: ComboboxCustomerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCustomer = data.find((customer) => customer.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedCustomer
            ? selectedCustomer.customerName
            : "Select customer..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search customer..." />
          <CommandEmpty>No customer found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {/* Clear selection option */}
            <CommandItem
              value="clear-selection"
              onSelect={() => {
                setSelected("");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !selectedId ? "opacity-100" : "opacity-0",
                )}
              />
              <span className="text-gray-500 italic">All Customers</span>
            </CommandItem>

            {data.map((customer) => (
              <CommandItem
                key={customer.id}
                value={`${customer.customerName}-${customer.customerCode}-${customer.id}`}
                onSelect={() => {
                  setSelected(customer.id.toString());
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedId === customer.id ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{customer.customerName}</span>
                  <span className="text-xs text-gray-500">
                    {customer.customerCode} • {customer.city}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
