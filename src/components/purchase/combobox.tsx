'use client'

import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"
import { ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"


export default function Combobox({ 
    data, 
    setFunc, 
    group, 
    tempId,
    selectedId
}: {
    data: {id: number, name: string, code: string}[], 
    tempId?: string, 
    group: string, 
    setFunc: any,
    selectedId?: number
}) {

    const [open, setOpen] = useState(false); 
    const [currentValue, setCurrentValue] = useState(''); 

    useEffect(() => {
        if (selectedId) {
            const selectedItem = data.find(item => item.id === selectedId);
            if (selectedItem) {
                setCurrentValue(selectedItem.name);
            }
        } else {
            setCurrentValue('');
        }
    }, [selectedId, data]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                variant='outline'
                title='Select a Brand'
                role='combobox'
                aria-expanded={open}
                className="w-full justify-between"
                >
                    {currentValue || `Select ${group}`}
                    <ChevronsUpDown size={24}/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="border rounded-lg w-[200px] p-0" side="right">
                <Command>
                    <CommandInput placeholder={`Search ${group}...`} className="h-9"/>
                    <CommandList>
                        <CommandEmpty>No {group} found.</CommandEmpty>
                        <CommandGroup>
                            {data.map((item) => (
                            <CommandItem
                            key={item.id.toString()}
                            value={item.name}
                            onSelect={() => {
                                setCurrentValue(item.name)
                                setFunc(tempId, group, item.id.toString())
                                setOpen(false)
                            }}
                            >
                                {item.name}
                            </CommandItem>))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}