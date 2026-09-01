"use client";

import React, { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineDelete, MdSave } from "react-icons/md";
import { RxReset } from "react-icons/rx";
import { motion, AnimatePresence } from "motion/react";
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

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import { getAllTaxes, Tax } from "@/actions/tax/actions";
import { saveBrandBatch } from "@/actions/masters/saveBrandBatch";

interface GridProps {
  name: string;
  data: any[];
  onDataChange?: (data: any[]) => void;
}

export default function BrandGrid({ name, data, onDataChange }: GridProps) {
  const [dataLocal, setDataLocal] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);

  useEffect(() => {
    getAllTaxes().then(setTaxes);
  }, []);

  // ✅ normalize multi taxIds
  useEffect(() => {
    const normalized = (data || []).map((item) => ({
      ...item,
      taxIds:
        item.taxIds ||
        item.taxes?.map((t: any) => String(t.taxId)) ||
        [],
    }));

    setDataLocal(normalized);
    setOriginalData(JSON.parse(JSON.stringify(normalized)));
    setDeletedIds([]);
  }, [data]);

  const generateNextCode = () => {
    if (dataLocal.length === 0) return "BM00001";
    const last = dataLocal[dataLocal.length - 1];
    const num = parseInt(last.brandCode.replace("BM", ""));
    return `BM${String(num + 1).padStart(5, "0")}`;
  };

  const hasChanges = () => {
    if (deletedIds.length > 0) return true;
    if (dataLocal.length !== originalData.length) return true;

    for (let item of dataLocal) {
      const original = originalData.find((o) => o.id === item.id);
      if (!original) return true;

      if (
        item.brandName !== original.brandName ||
        item.brandCode !== original.brandCode ||
        JSON.stringify(item.taxIds) !== JSON.stringify(original.taxIds)
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

        const payload = {
          ...item,
          taxIds: item.taxIds,
        };

        if (!original) {
          const { id, ...rest } = payload;
          toCreate.push(rest);
        } else if (
          item.brandName !== original.brandName ||
          item.brandCode !== original.brandCode ||
          JSON.stringify(item.taxIds) !== JSON.stringify(original.taxIds)
        ) {
          toUpdate.push(payload);
        }
      });

      const result = await saveBrandBatch({
        create: toCreate,
        update: toUpdate,
        delete: deletedIds,
      });

      if (!result.success) throw new Error(result.error);

      toast.success("Saved successfully");

      const normalized = result.data!.map((item: any) => ({
        ...item,
        taxIds: item.taxes?.map((t: any) => String(t.taxId)) || [],
      }));

      setOriginalData(normalized);
      setDataLocal(normalized);
      setDeletedIds([]);

      onDataChange?.(normalized);
    } catch (err: any) {
      toast.error(err.message || "Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (idx: number) => {
    const item = dataLocal[idx];

    if (item.id > 0) {
      setDeletedIds((prev) => [...prev, item.id]);
    }

    const copy = [...dataLocal];
    copy.splice(idx, 1);
    setDataLocal(copy);

    toast.info("Marked for deletion");
  };

  const handleAdd = () => {
    const newItem = {
      id: -Date.now(),
      brandCode: generateNextCode(),
      brandName: "",
      taxIds: [],
    };

    setDataLocal((prev) => [...prev, newItem]);
  };

  const handleReset = () => {
    setDataLocal(JSON.parse(JSON.stringify(originalData)));
    setDeletedIds([]);
    toast.info("Reset done");
  };

  const toggleTax = (idx: number, taxId: string) => {
    const copy = [...dataLocal];
    const exists = copy[idx].taxIds.includes(taxId);

    copy[idx].taxIds = exists
      ? copy[idx].taxIds.filter((t: string) => t !== taxId)
      : [...copy[idx].taxIds, taxId];

    setDataLocal(copy);
  };

  const unsavedChanges = hasChanges();

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">{name} Master</CardTitle>
        <CardDescription>
          Manage brand + multiple tax category mapping
        </CardDescription>
      </CardHeader>

      <Separator />

      <CardContent className="p-6">
        <div className="border rounded-xl overflow-hidden">
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Tax Categories</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                <AnimatePresence>
                  {dataLocal.map((item, idx) => (
                    <motion.tr key={item.id}>
                      <TableCell>
                        <Badge>{item.id < 0 ? "NEW" : item.id}</Badge>
                      </TableCell>

                      <TableCell>{item.brandCode}</TableCell>

                      <TableCell>
                        <Input
                          value={item.brandName}
                          onChange={(e) => {
                            const copy = [...dataLocal];
                            copy[idx].brandName = e.target.value;
                            setDataLocal(copy);
                          }}
                        />
                      </TableCell>

                      {/* 🔥 BEAUTIFUL MULTI SELECT */}
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start flex-wrap h-auto">
                              {item.taxIds.length === 0 && "Select Taxes"}

                              <div className="flex gap-1 flex-wrap">
                                {item.taxIds.map((id: string) => {
                                  const tax = taxes.find(
                                    (t) => String(t.taxId) === id,
                                  );
                                  return (
                                    <Badge key={id} variant="secondary">
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

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(idx)}
                        >
                          <MdOutlineDelete />
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>

          <div className="p-3 border-t">
            <Button onClick={handleAdd} variant="outline" className="w-full">
              <IoMdAdd className="mr-2" /> Add Brand
            </Button>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button onClick={handleReset} disabled={!unsavedChanges}>
            <RxReset className="mr-2" /> Reset
          </Button>

          <Button
            onClick={handleSave}
            disabled={!unsavedChanges || isLoading}
          >
            <MdSave className="mr-2" />
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}