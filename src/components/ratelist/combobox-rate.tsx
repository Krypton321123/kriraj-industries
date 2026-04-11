

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";

const ComboboxForRate = ({ data, setFn }: { data: any[]; setFn: any }) => {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? data.find((item) => item.customerCode === value)?.customerName
            : "Select Customer"}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-52">
        <Command>
          <CommandInput placeholder="Search Customers" className="h-9" />
          <CommandList>
            <CommandEmpty>No customers found</CommandEmpty>

            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.customerCode}
                  value={item.customerCode} // ✅ string value
                  onSelect={(currentValue) => {
                    const selected = data.find(
                      (d) => d.customerCode === currentValue
                    );

                    setValue(currentValue);
                    setFn(selected); // ✅ pass full object
                    setOpen(false);
                  }}
                >
                  {item.customerName}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ComboboxForRate; 