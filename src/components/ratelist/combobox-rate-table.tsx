"use client" 

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {useState} from "react";

interface RateTableOption {
    id: number;
    [key: string]: any; // covers brandName, typeName, categoryName, qualityName
}


const ComboboxRateTable = ({data, setFn, id, callFor} : {data: RateTableOption[], setFn: any, id: number, callFor: string}) => {

    const [objectSpec, setObjectSpec] = useState(() => {
        switch(callFor) {
            case "brand": return "brandName";
            case "type" : return "typeName";
            case "category" : return "categoryName";
            case "quality": return "qualityName"
            default: return "brand";
        }
    }); 

const onChange = (value: RateTableOption | null) => {
    if (value === null) return;
    return setFn((prev: any) => {
        return prev.map((item: any) => {
            if (item.id === id) {
                return { ...item, [callFor]: value[objectSpec] };
            }
            return { ...item };
        });
    });
};
    return (
        <Combobox<RateTableOption>
    items={data}
    onValueChange={onChange}
    itemToStringValue={(item: RateTableOption | null) => item?.id.toString() ?? ""}
    autoHighlight
> 
    <ComboboxInput placeholder={`Select a ${callFor}`} /> 
    <ComboboxContent> 
        <ComboboxEmpty> No items found </ComboboxEmpty>
        <ComboboxList>
            {(item: RateTableOption) => (
                <ComboboxItem key={item.id} value={item[objectSpec]}>
                    {item[objectSpec]}
                </ComboboxItem>
            )}
        </ComboboxList>
    </ComboboxContent>
</Combobox>
    ) 
}

export default ComboboxRateTable; 
