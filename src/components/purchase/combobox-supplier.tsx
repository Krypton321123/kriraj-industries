'use client'
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command";
import { ChevronsUpDown } from "lucide-react";

export default function ComboboxSupplier({ data, setSelected, selectedId }: {data: any, setSelected: (id: string) => void, selectedId: number | undefined}) {

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState('')

    console.log('value =>', value)

    useEffect(() => {
        if (selectedId) {
            const selected = data.find((item: any) => item.id === selectedId); 
            setValue(selected.supplierName); 
        } else {
            setValue('')
        }
    }, [selectedId, data])

    return (
        <div>
            <Popover
            open={open}
            onOpenChange={setOpen}
            >
                <PopoverTrigger asChild>
                    <Button 
                    variant="outline"
                    aria-expanded={open}
                    role="combobox"
                    className="flex justify-between items-center"
                    >
                        {value ? value : "Select Supplier"}
                        <ChevronsUpDown size={24}/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="border rounded-lg w-[200px] p-0" side={"right"}>
                    <Command>
                        <CommandEmpty>No suppliers found</CommandEmpty>
                        <CommandInput title={"Search Supplier"} className="h-4"/>
                        <CommandList>
                            <CommandGroup>
                                {data.map((item: any) => {
                                    return <CommandItem key={item.id} onSelect={(currentVal) => {
                                        setValue(item.id)
                                        setSelected(item.id)
                                    }}>
                                        {item.supplierName}
                                    </CommandItem>
                                })}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    )
}