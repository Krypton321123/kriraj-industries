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

type SalesType = {
  id: number;
  code: string;
  name: string;
};

type ComboboxSalesTypeProps = {
  data: SalesType[];
  setSelected: (value: string) => void;
  selectedId: number;
};

export default function ComboboxSalesType({
  data,
  setSelected,
  selectedId,
}: ComboboxSalesTypeProps) {
  const [open, setOpen] = React.useState(false);

  const selectedSalesType = data.find((type) => type.id === selectedId);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedSalesType
            ? selectedSalesType.name
            : "Select sales type..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search sales type..." />
          <CommandEmpty>No sales type found.</CommandEmpty>
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
              <span className="text-gray-500 italic">All Sales Types</span>
            </CommandItem>

            {data.map((type) => (
              <CommandItem
                key={type.id}
                value={`${type.name}-${type.code}-${type.id}`}
                onSelect={() => {
                  setSelected(type.id.toString());
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedId === type.id ? "opacity-100" : "opacity-0",
                  )}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{type.name}</span>
                  <span className="text-xs text-gray-500">{type.code}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}