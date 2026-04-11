"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Trash, Plus } from "lucide-react";
import {
  getRateListByCustomer,
  rateListFirstSelection,
  rateListSecondSelection,
  saveRateList,
} from "@/actions/ratelist-actions";

interface TaxSelectHeaderProps {
  taxes: any[];
  value: string;
  onChange: (val: string) => void;
}

const TaxSelectHeader = ({ taxes, value, onChange }: TaxSelectHeaderProps) => (
  <div className="flex flex-col gap-1 min-w-[100px]">
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-7 text-xs font-normal bg-yellow-50 border-yellow-300">
        <SelectValue placeholder="Select tax" />
      </SelectTrigger>
      <SelectContent>
        {taxes?.map((tax: any) => (
          <SelectItem key={tax.taxId} value={String(tax.taxId)}>
            {tax.comName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

interface rateTableItem {
  id: number;
  brand: number;
  category: number;
  type: number;
  quality: number;

  values: number[];

  freight: number;
  paint: number;
  labour: number;
  packing: number;
  margin: number;
  wastage: number;

  total: number;
  nettRate: number;
}

interface ColumnTaxes {
  rawmat: string;
  sticker: string;
  glassCost: string;
  freight: string;
  paint: string;
}

const RateTable = ({
  itemData,
  taxes,
  customerId,
}: {
  itemData: any;
  taxes: any;
  customerId: number;
}) => {
  const [items, setItems] = useState<rateTableItem[]>([]);
  console.log("customerid", customerId);

  const [bulkConfig, setBulkConfig] = useState({
    category: "",
    field: "",
    value: "",
  });
  const [columns, setColumns] = useState([
    { key: "rawmat", taxId: "" },
    { key: "sticker", taxId: "" },
    { key: "glassCost", taxId: "" },
    { key: "freight", taxId: "" },
    { key: "paint", taxId: "" },
  ]);

  const brandMap = Object.fromEntries(
    itemData.brands.map((b: any) => [b.id, b]),
  );
  const categoryMap = Object.fromEntries(
    itemData.category.map((c: any) => [c.id, c]),
  );
  const typeMap = Object.fromEntries(itemData.types.map((t: any) => [t.id, t]));
  const qualityMap = Object.fromEntries(
    itemData.quality.map((q: any) => [q.id, q]),
  );

  useEffect(() => {
    const loadAndSync = async () => {
      if (!customerId) return;

      const saved = await getRateListByCustomer(customerId);

      if (!saved) return;

      // ✅ 1. Set columns
      const sortedColumns = saved.columns.sort(
        (a: any, b: any) => a.columnIndex - b.columnIndex,
      );

      const updatedColumns = sortedColumns.map((col: any) => ({
        key: `col-${col.columnIndex}`,
        taxId: col.taxId,
      }));

      setColumns(updatedColumns);

      // ✅ 2. Load saved items
      let mappedItems = saved.items.map((item: any, index: number) => {
        const valuesArray: number[] = [];

        item.values.forEach((v: any) => {
          valuesArray[v.columnIndex] = Number(v.value);
        });

        return {
          id: index,
          brand: item.brandId,
          category: item.categoryId,
          type: item.typeId,
          quality: item.qualityId,

          values: valuesArray,

          freight: Number(item.freight),
          labour: Number(item.labour),
          packing: Number(item.packing),
          margin: Number(item.margin),
          wastage: Number(item.wastage),
        };
      });

      // ============================
      // 🚀 3. FIRST COLUMN SYNC
      // ============================

      const firstTaxId = updatedColumns[0]?.taxId;

      if (!firstTaxId) {
        setItems(mappedItems);
        return;
      }

      const freshCombinations = await rateListFirstSelection(firstTaxId);

      // Create key for comparison
      const makeKey = (item: any) =>
        `${item.brand}-${item.category}-${item.type}-${item.quality}`;

      const existingMap = new Map(mappedItems.map((i: any) => [makeKey(i), i]));

      // ✅ Add missing combinations
      freshCombinations.forEach((combo: any) => {
        const key = makeKey({
          brand: combo.brandId,
          category: combo.categoryId,
          type: combo.typeId,
          quality: combo.qualityId,
        });

        if (!existingMap.has(key)) {
          mappedItems.push({
            id: mappedItems.length + 1,
            brand: combo.brandId,
            category: combo.categoryId,
            type: combo.typeId,
            quality: combo.qualityId,

            values: updatedColumns.map((_, idx) =>
              idx === 0 ? combo.purchaseRate || 0 : 0,
            ),

            freight: 0,
            labour: 0,
            packing: 0,
            margin: 0,
            wastage: 0,
          });
        }
      });

      // ============================
      // 🚀 4. OTHER COLUMNS SYNC
      // ============================

      for (let colIndex = 1; colIndex < updatedColumns.length; colIndex++) {
        const taxId = updatedColumns[colIndex]?.taxId;
        if (!taxId) continue;

        const combinations = mappedItems.map((item: any) => ({
          brandId: item.brand,
          categoryId: item.category,
          typeId: item.type,
          qualityId: item.quality,
        }));

        const result = await rateListSecondSelection(taxId, combinations);

        mappedItems = mappedItems.map((item: any) => {
          const match = result.find(
            (d: any) =>
              d.brandId === item.brand &&
              d.categoryId === item.category &&
              d.typeId === item.type &&
              d.qualityId === item.quality,
          );

          const newValues = [...item.values];
          newValues[colIndex] = match?.purchaseRate || newValues[colIndex] || 0;

          return {
            ...item,
            values: newValues,
          };
        });
      }

      // ============================
      // ✅ FINAL CALCULATION
      // ============================

      const finalItems = mappedItems.map((item: any) => ({
        ...item,
        ...calculateRow(item),
      }));

      setItems(finalItems);
    };

    loadAndSync();
  }, [customerId]);

  const addEmptyItem = () => {
    setItems((prev: any) => {
      return [
        ...prev,
        {
          id: prev.length != 0 ? prev[prev.length - 1].id + 1 : 0,
          brand: "",
          category: "",
          type: "",
          quality: "",
          rawmat: "",
          sticker: "",
          glassCost: 0,
          freight: 0,
          paint: 0,
          labour: 0,
          packing: 0,
          margin: 0,
          wastage: 0,
          total: 0,
          nettRate: 0,
        },
      ];
    });
  };

  const handleTaxChange = async (colIndex: number, taxId: string) => {
    // update column tax
    const updatedColumns = [...columns];
    updatedColumns[colIndex].taxId = taxId;
    setColumns(updatedColumns);

    // if FIRST column OR no data → rebuild rows
    if (colIndex === 0 || items.length === 0) {
      const data = await rateListFirstSelection(taxId);

      const mapped = data.map((item: any, i: number) => ({
        id: i,
        brand: item.brandId,
        category: item.categoryId,
        type: item.typeId,
        quality: item.qualityId,

        values: updatedColumns.map((_, idx) =>
          idx === colIndex ? item.purchaseRate || 0 : 0,
        ),

        freight: 0,
        paint: 0,
        labour: 0,
        packing: 0,
        margin: 0,
        wastage: 0,
      }));

      const final = mapped.map((item) => ({
        ...item,
        ...calculateRow(item),
      }));

      setItems(final);
      return;
    }

    // OTHER columns → fill existing rows
    const combinations = items.map((item) => ({
      brandId: item.brand,
      categoryId: item.category,
      typeId: item.type,
      qualityId: item.quality,
    }));

    const data = await rateListSecondSelection(taxId, combinations);

    setItems((prev) =>
      prev.map((item) => {
        const match = data.find(
          (d: any) =>
            d.brandId === item.brand &&
            d.categoryId === item.category &&
            d.typeId === item.type &&
            d.qualityId === item.quality,
        );

        const newValues = [...item.values];
        newValues[colIndex] = match?.purchaseRate || 0;

        const updated = { ...item, values: newValues };

        return {
          ...updated,
          ...calculateRow(updated),
        };
      }),
    );
  };
  const calculateRow = (item: any) => {
    const dynamicTotal = item.values.reduce(
      (sum: number, v: any) => sum + Number(v || 0),
      0,
    );

    const total =
      dynamicTotal + item.labour + item.packing + item.margin + item.wastage;

    const nettRate = Math.round(total / 5) * 5;

    return { total, nettRate };
  };

  const bulkUpdate = (category: string, field: string, value: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (String(item.category) !== category) return item;

        const updated = { ...item, [field]: value };
        const calc = calculateRow(updated);

        return { ...updated, ...calc };
      }),
    );
  };

  const updateItem = (id: number, field: string, value: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;

        const updated = { ...i, [field]: value };
        const calc = calculateRow(updated);

        return { ...updated, ...calc };
      }),
    );
  };

  const setGlobalValues = (config: any, value: any, id: any) => {
    if (value === 0) return alert("Please enter a valid value");
    return setItems((prev) =>
      prev.map((item) => ({ ...item, [config]: Number(value) })),
    );
  };

  return (
    <div className="w-full rounded-lg shadow-md shadow-gray-200 bg-white border-gray-200 border p-2">
      <div className="flex gap-6 py-4 items-end">
        {/* Brand Select */}
        <div className="flex flex-col gap-1">
          <label className="text-sm">Brand</label>
          <Select
            value={bulkConfig.category}
            onValueChange={(val) =>
              setBulkConfig((prev) => ({ ...prev, category: val }))
            }
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select Brand" />
            </SelectTrigger>
            <SelectContent>
              {itemData.category.map((b: any) => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.categoryName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Column Select */}
        <div className="flex flex-col gap-1">
          <label className="text-sm">Column</label>
          <Select
            value={bulkConfig.field}
            onValueChange={(val) =>
              setBulkConfig((prev) => ({ ...prev, field: val }))
            }
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="labour">Labour</SelectItem>
              <SelectItem value="packing">Packing</SelectItem>
              <SelectItem value="freight">Freight</SelectItem>
              <SelectItem value="paint">Paint</SelectItem>
              <SelectItem value="margin">Margin</SelectItem>
              <SelectItem value="wastage">Wastage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Value Input */}
        <div className="flex flex-col gap-1">
          <label className="text-sm">Value</label>
          <Input
            type="number"
            value={bulkConfig.value}
            onChange={(e) =>
              setBulkConfig((prev) => ({
                ...prev,
                value: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = Number(bulkConfig.value);

                if (!bulkConfig.category || !bulkConfig.field || !val) {
                  return alert("Fill all fields properly");
                }

                bulkUpdate(bulkConfig.category, bulkConfig.field, val);

                setItems((prev) =>
                  prev.map((item) =>
                    String(item.category) === bulkConfig.category
                      ? { ...item, [bulkConfig.field]: val }
                      : item,
                  ),
                );
              }
            }}
            className="w-[120px]"
          />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-yellow-100 hover:bg-yellow-200">
            <TableHead className="font-semibold min-w-[120px] text-md">
              Brand
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Category
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Type
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Quality
            </TableHead>
            {columns.map((col, index) => (
              <TableHead className="font-semibold text-md" key={col.key}>
                <TaxSelectHeader
                  taxes={taxes}
                  value={col.taxId}
                  onChange={(val) => handleTaxChange(index, val)}
                />
              </TableHead>
            ))}
            <TableHead className="font-semibold min-w-[120px] text-md">
              Freight
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Paint
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Labour
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Packing
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Margin
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Wastage
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Total
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Nett Rate
            </TableHead>
            <TableHead className="font-semibold min-w-[120px] text-md">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="w-40">
                <Input
                  readOnly
                  value={brandMap[item.brand]?.brandName || ""}
                  disabled
                />
              </TableCell>
              <TableCell className="w-40">
                <Input
                  readOnly
                  value={categoryMap[item.category]?.categoryName || ""}
                  disabled
                />
              </TableCell>
              <TableCell className="w-40">
                <Input
                  readOnly
                  value={typeMap[item.type]?.typeName || ""}
                  disabled
                />
              </TableCell>
              <TableCell className="w-40">
                <Input
                  readOnly
                  value={qualityMap[item.quality]?.qualityName || ""}
                  disabled
                />
              </TableCell>
              {columns.map((col, colIndex) => (
                <TableCell className="w-32" key={colIndex}>
                  <Input
                    type="number"
                    value={item.values[colIndex] || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);

                      setItems((prev) =>
                        prev.map((i) => {
                          if (i.id !== item.id) return i;

                          const newValues = [...i.values];
                          newValues[colIndex] = val;

                          const updated = { ...i, values: newValues };

                          return {
                            ...updated,
                            ...calculateRow(updated),
                          };
                        }),
                      );
                    }}
                  />
                </TableCell>
              ))}

              <TableCell className="w-32">
                <Input
                  value={item.freight}
                  type="number"
                  onChange={(e) => {
                    updateItem(item.id, "freight", Number(e.target.value));
                  }}
                />
              </TableCell>

              <TableCell className="w-32">
                <Input
                  value={item.paint}
                  type="number"
                  onChange={(e) => {
                    updateItem(item.id, "paint", Number(e.target.value));
                  }}
                />
              </TableCell>
              <TableCell className="w-32">
                <Input
                  value={item.labour}
                  type="number"
                  onChange={(e) => {
                    updateItem(item.id, "labour", Number(e.target.value));
                  }}
                />
              </TableCell>
              <TableCell className="w-32">
                <Input
                  value={item.packing}
                  type="number"
                  onChange={(e) => {
                    updateItem(item.id, "packing", Number(e.target.value));
                  }}
                />
              </TableCell>
              <TableCell className="w-32">
                <Input
                  value={item.margin}
                  type="number"
                  onChange={(e) => {
                    updateItem(item.id, "margin", Number(e.target.value));
                  }}
                />
              </TableCell>
              <TableCell className="w-32">
                <Input
                  value={item.wastage}
                  type="number"
                  onChange={(e) => {
                    updateItem(item.id, "wastage", Number(e.target.value));
                  }}
                />
              </TableCell>
              <TableCell className="w-32">
                <Input value={item.total} readOnly />
              </TableCell>
              <TableCell className="w-32">
                <Input value={item.nettRate} readOnly />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  className="cursor-pointer hover:opacity-80"
                  onClick={() =>
                    setItems((prev) =>
                      prev.filter((item1) => item1.id !== item.id),
                    )
                  }
                >
                  <Trash />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            {Array(17)
              .fill(0)
              .map((_, idx) => (
                <TableCell key={idx}></TableCell>
              ))}
            <TableCell>
              <Button
                variant="outline"
                onClick={addEmptyItem}
                className="cursor-pointer"
              >
                <Plus />
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="flex justify-end mt-4">
        <Button
          onClick={async () => {
            await saveRateList({
              customerId,
              columns,
              items,
            });

            alert("Saved");
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default RateTable;
