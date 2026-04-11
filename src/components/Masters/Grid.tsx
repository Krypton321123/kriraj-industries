"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineDelete, MdSave } from "react-icons/md";
import { RxReset } from "react-icons/rx";
import { motion, AnimatePresence } from "motion/react";
import { saveMasterBatch } from "@/actions/masters/actions";
import { toast } from "react-toastify";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandInput, CommandItem, CommandList } from "../ui/command";
import { getAllTaxes, Tax } from "@/actions/tax/actions";

interface GridProps {
  noOfCols: number;
  name: string;
  masterType:
    | "brand"
    | "quality"
    | "type"
    | "category"
    | "color"
    | "colorType"
    | "colorCompany"
    | "glassQuality"
    | "glassType"
    | "stickerType"
    | "bank";
  data: any[];
  onDataChange?: (data: any[]) => void;
}

// Master configuration mapping
const MASTER_CONFIG = {
  brand: {
    prefix: "BM",
    codeField: "brandCode",
    nameField: "brandName",
    hasTax: true,
  },
  quality: {
    prefix: "QM",
    codeField: "qualityCode",
    nameField: "qualityName",
    hasTax: true,
  },
  type: {
    prefix: "TM",
    codeField: "typeCode",
    nameField: "typeName",
    hasTax: true,
  },
  category: {
    prefix: "CM",
    codeField: "categoryCode",
    nameField: "categoryName",
    hasTax: true,
  },

  // ❌ no tax
  color: {
    prefix: "CLM",
    codeField: "colorCode",
    nameField: "colorName",
    hasTax: false,
  },
  colorType: {
    prefix: "CTM",
    codeField: "colorTypeCode",
    nameField: "colorTypeName",
    hasTax: false,
  },
  colorCompany: {
    prefix: "CCM",
    codeField: "colorCompanyCode",
    nameField: "colorCompanyName",
    hasTax: false,
  },
  glassQuality: {
    prefix: "GQM",
    codeField: "glassQualityCode",
    nameField: "glassQualityName",
    hasTax: false,
  },
  glassType: {
    prefix: "GTM",
    codeField: "glassTypeCode",
    nameField: "glassTypeName",
    hasTax: false,
  },
  stickerType: {
    prefix: "STM",
    codeField: "stickerTypeCode",
    nameField: "stickerTypeName",
    hasTax: false,
  },
  bank: {
    prefix: "BKM",
    codeField: "bankCode",
    nameField: "bankName",
    hasTax: false,
  },
};
export default function Grid({
  noOfCols,
  name,
  masterType,
  data,
  onDataChange,
}: GridProps) {
  const [dataLocal, setDataLocal] = useState<any[]>(data || []);
  const [originalData, setOriginalData] = useState<any[]>(
    JSON.parse(JSON.stringify(data || [])),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  const config = MASTER_CONFIG[masterType];

  // Update local data when prop changes
  useEffect(() => {
    const normalized = data.map((item: any) => {
      if (config.hasTax) {
        return {
          ...item,
          taxes: item.taxes?.map((t: any) => String(t.taxId)) || [],
        };
      }
      return item;
    });

    setOriginalData(JSON.parse(JSON.stringify(normalized)));
    setDataLocal(normalized);
    setDeletedIds([]);
  }, [data]);

  useEffect(() => {
    if (config.hasTax) {
      getAllTaxes().then(setTaxes);
    }
  }, [masterType]);

  // Generate next code
  const generateNextCode = () => {
    if (dataLocal.length === 0) {
      return `${config.prefix}00001`;
    }

    const lastItem = dataLocal[dataLocal.length - 1];
    const lastCode = lastItem[config.codeField];
    const lastNumber = parseInt(lastCode.replace(config.prefix, ""));
    const nextNumber = (lastNumber + 1).toString().padStart(5, "0");
    return `${config.prefix}${nextNumber}`;
  };

  const toggleTax = (idx: number, taxId: string) => {
    const copy = [...dataLocal];

    const exists = copy[idx].taxes?.includes(taxId);

    copy[idx].taxes = exists
      ? copy[idx].taxes.filter((t: string) => t !== taxId)
      : [...(copy[idx].taxes || []), taxId];

    setDataLocal(copy);
  };

  // Check if there are actual changes
  const hasChanges = () => {
    // Check for deletions
    if (deletedIds.length > 0) return true;

    // Check for modifications or additions
    if (dataLocal.length !== originalData.length) return true;

    for (let i = 0; i < dataLocal.length; i++) {
      const current = dataLocal[i];
      const original = originalData.find((item) => item.id === current.id);

      // New item (no matching original)
      if (!original) return true;
      if (config.hasTax) {
        if (JSON.stringify(current.taxes) !== JSON.stringify(original.taxes)) {
          return true;
        }
      }

      // Modified item
      if (
        current[config.nameField] !== original[config.nameField] ||
        current[config.codeField] !== original[config.codeField]
      ) {
        return true;
      }
    }

    return false;
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const toCreate: any[] = [];
      const toUpdate: any[] = [];

      dataLocal.forEach((item) => {
        const original = originalData.find((o) => o.id === item.id);

        const payload: any = {
          ...item,
          taxIds: item.taxes || [], // 🔥 FIX
        };

        if (!original) {
          const { id, ...rest } = payload;
          toCreate.push(rest);
        } else {
          let changed =
            item[config.nameField] !== original[config.nameField] ||
            item[config.codeField] !== original[config.codeField] ||
            (config.hasTax &&
              JSON.stringify(item.taxes) !== JSON.stringify(original.taxes));

          if (changed) {
            toUpdate.push(payload);
          }
        }
      });

      const result = await saveMasterBatch(masterType, {
        create: toCreate,
        update: toUpdate,
        delete: deletedIds,
      });

      if (result.success) {
        toast.success("Data saved successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        const normalized = result.data.map((item: any) => {
          if (config.hasTax) {
            return {
              ...item,
              taxes: item.taxes?.map((t: any) => String(t.taxId)) || [],
            };
          }
          return item;
        });

        setOriginalData(JSON.parse(JSON.stringify(normalized)));
        setDataLocal(normalized);
        setDeletedIds([]);
        setEditingIndex(null);

        if (onDataChange) {
          onDataChange(result.data);
        }
      } else {
        throw new Error(result.error || "Failed to save data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save data", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (idx: number) => {
    const itemToDelete = dataLocal[idx];

    // If item has a real ID (exists in database), track it for deletion
    if (itemToDelete.id > 0) {
      setDeletedIds((prev) => [...prev, itemToDelete.id]);
    }

    const copy = [...dataLocal];
    copy.splice(idx, 1);
    setDataLocal(copy);

    toast.info("Row marked for deletion", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const handleAdd = () => {
    const newCode = generateNextCode();

    // Use negative ID for new items to distinguish from database records
    const tempId = -Date.now();

    const newItem = {
      id: tempId,
      [config.codeField]: newCode,
      [config.nameField]: "",
      ...(config.hasTax && { taxes: [] }), // 🔥 REQUIRED
    };

    setDataLocal((prev) => [...prev, newItem]);
    setEditingIndex(dataLocal.length);
  };

  const handleReset = () => {
    setDataLocal(JSON.parse(JSON.stringify(originalData)));
    setDeletedIds([]);
    setEditingIndex(null);
    toast.info("Changes reset", {
      position: "top-right",
      autoClose: 2000,
    });
  };

  const unsavedChanges = hasChanges();

  return (
    <Card className="w-full border-0 shadow-xl bg-gradient-to-br from-white via-gray-50/30 to-white">
      <CardHeader className="space-y-1 pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-semibold tracking-tight">
              {" Master Management "}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage your {name.toLowerCase()} catalog with ease
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {unsavedChanges && (
              <Badge
                variant="secondary"
                className="bg-amber-50 text-amber-700 border-amber-200"
              >
                Unsaved changes
              </Badge>
            )}
            {deletedIds.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-red-50 text-red-700 border-red-200"
              >
                {deletedIds.length} to delete
              </Badge>
            )}
            <Badge variant="outline" className="font-mono">
              {dataLocal.length} {dataLocal.length === 1 ? "entry" : "entries"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <Separator className="opacity-50" />

      <CardContent className="p-6">
        <div className="rounded-xl border bg-white/50 backdrop-blur-sm overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b-2">
                  <TableHead className="w-[100px] font-semibold text-gray-700">
                    ID
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    Code
                  </TableHead>
                  <TableHead className="font-semibold text-gray-700">
                    {name} Name
                  </TableHead>
                  {config.hasTax && <TableHead>Tax Categories</TableHead>}
                  <TableHead className="text-right font-semibold text-gray-700 w-[100px]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dataLocal.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-[300px] text-center">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="rounded-full bg-gray-100 p-4">
                          <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                            />
                          </svg>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">
                            No {name.toLowerCase()}s yet
                          </p>
                          <p className="text-sm text-gray-500">
                            Get started by adding your first{" "}
                            {name.toLowerCase()}
                          </p>
                        </div>
                        <Button
                          onClick={handleAdd}
                          size="sm"
                          className="mt-2"
                          variant="outline"
                        >
                          <IoMdAdd className="mr-2 h-4 w-4" />
                          Add First {name}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {dataLocal.map((item, idx) => {
                      const isNew = item.id < 0;
                      const original = originalData.find(
                        (o) => o.id === item.id,
                      );
                      const isModified =
                        original &&
                        (item[config.nameField] !==
                          original[config.nameField] ||
                          item[config.codeField] !==
                            original[config.codeField]);

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2, delay: idx * 0.02 }}
                          className={cn(
                            "group border-b transition-colors",
                            editingIndex === idx && "bg-blue-50/50",
                            isNew && "bg-green-50/30",
                            isModified && "bg-yellow-50/30",
                          )}
                        >
                          <TableCell className="font-medium text-gray-600">
                            <Badge
                              variant="outline"
                              className={cn(
                                "font-mono",
                                isNew &&
                                  "bg-green-100 border-green-300 text-green-700",
                              )}
                            >
                              {isNew ? "NEW" : `#${item.id}`}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-medium text-gray-700">
                              {item[config.codeField]}
                            </code>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item[config.nameField]}
                              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                const copy = [...dataLocal];
                                copy[idx][config.nameField] = e.target.value;
                                setDataLocal(copy);
                                setEditingIndex(idx);
                              }}
                              onFocus={() => setEditingIndex(idx)}
                              placeholder={`Enter ${name.toLowerCase()} name...`}
                              className={cn(
                                "bg-transparent border-gray-200 focus:border-blue-400 transition-all",
                                "placeholder:text-gray-400 h-9",
                                editingIndex === idx &&
                                  "border-blue-400 bg-white",
                              )}
                            />
                          </TableCell>
                          {config.hasTax && (
                            <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full flex-wrap h-auto"
                                  >
                                    {item.taxes.length === 0 && "Select Taxes"}

                                    <div className="flex gap-1 flex-wrap">
                                      {item.taxes.map((t: any) => {
                                        const taxId =
                                          typeof t === "string" ? t : t.taxId; // 🔥 FIX
                                        const tax = taxes.find(
                                          (x) =>
                                            String(x.taxId) === String(taxId),
                                        );

                                        return (
                                          <Badge key={taxId}>
                                            {tax?.comName}
                                          </Badge>
                                        );
                                      })}
                                    </div>
                                  </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[250px] p-0">
                                  <Command>
                                    <CommandInput placeholder="Search tax..." />
                                    <CommandList>
                                      {taxes.map((tax) => (
                                        <CommandItem
                                          key={tax.taxId}
                                          onSelect={() =>
                                            toggleTax(idx, String(tax.taxId))
                                          }
                                        >
                                          {tax.comName}
                                        </CommandItem>
                                      ))}
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(idx)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <MdOutlineDelete className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="text-xs">Delete row</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Add New Row Button */}
          <div className="border-t bg-gray-50/50 p-3">
            <Button
              onClick={handleAdd}
              variant="outline"
              size="sm"
              className="w-full border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 hover:bg-gray-50"
            >
              <IoMdAdd className="mr-2 h-4 w-4" />
              Add New {name}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="text-sm text-muted-foreground">
            {unsavedChanges && (
              <span className="text-amber-600 font-medium">
                * You have unsaved changes
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              size="default"
              disabled={!unsavedChanges}
              className="border-gray-300"
            >
              <RxReset className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              size="default"
              disabled={isLoading || !unsavedChanges}
              className="min-w-[120px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <MdSave className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
