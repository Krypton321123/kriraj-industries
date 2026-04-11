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

const ComboboxRateTable = ({data, setFn, id, callFor} : {data: any, setFn: any, id: number, callFor: string}) => {

    const [objectSpec, setObjectSpec] = useState(() => {
        switch(callFor) {
            case "brand": return "brandName";
            case "type" : return "typeName";
            case "category" : return "categoryName";
            case "quality": return "qualityName"
            default: return "brand";
        }
    }); 

    const onChange = (value: string) => {
        return setFn(prev => {
            return prev.map(item => {
                if (item.id === id) {
                    return {...item, [callFor]: value}
                }
                return {...item}
            });
        });
    }
    return (
        <Combobox
            items={data}
            onValueChange={onChange}
            className=""
            itemToStringValue={(item) => item.id}
            autoHighlight
        > 
            <ComboboxInput placeholder={`Select a ${callFor}`} /> 
            <ComboboxContent> 
                <ComboboxEmpty> No items found </ComboboxEmpty>
                <ComboboxList>
                    {(item) => (
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
