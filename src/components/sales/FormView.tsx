"use client";

import {
  CalendarIcon,
  Plus,
  Save,
  Search,
  Trash2,
  X,
  RefreshCcw,
} from "lucide-react";

import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import {
  getCustomers,
  getSalesTypes,
  getRateListForCustomer,
  resolveRate,
  createSale,
  getOldSales,
  getNextSalesCode,
  getSalesById,
  updateSale,
} from "@/actions/sales/actions";

type ItemRow = {
  tempId: string;
  salesTypeId?: number;
  salesTypeCode?: string;

  brandId?: number;
  categoryId?: number;
  typeId?: number;
  qualityId?: number;

  qty: number;
  rate: number;
  amount: number;
  mrp: number;
  mrpDiff: number;
  diffAmount: number;
};

export default function FormView({
  setViewMode,
  setSalesRecords,
  isEditing,
}: any) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [salesTypes, setSalesTypes] = useState<any[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [salesman, setSalesman] = useState<any>(null);
  const [gstNumber, setGstNumber] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [rateList, setRateList] = useState<any>(null);

  const [salesCode, setSalesCode] = useState("");
  const [salesDate, setSalesDate] = useState<Date>(new Date());

  const [items, setItems] = useState<ItemRow[]>([]);
  const [oldSales, setOldSales] = useState<any[]>([]);

  const [remarks, setRemarks] = useState("");

  const [subTotal, setSubTotal] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [freight, setFreight] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [nettAmount, setNettAmount] = useState(0);
  console.log("items", items);

  const [loading, setLoading] = useState(false);

  // ---------------- INIT ----------------
  useEffect(() => {
    const load = async () => {
      const [cust, types] = await Promise.all([
        getCustomers(),
        getSalesTypes(),
      ]);
      const data = await getNextSalesCode();

      setCustomers(cust);
      setSalesTypes(types.data);
      setSalesCode(data?.salesCode || "");
      addNewRow();
    };

    load();
  }, []);

  console.log("isEditing", isEditing.data.id);

  useEffect(() => {
    if (!isEditing?.status || !isEditing?.data.id) return;

    const loadSale = async () => {
      const sale = await getSalesById(isEditing.data.salesCode);

      hydrateForm(sale);
    };

    loadSale();
  }, [isEditing]);

  const hydrateForm = async (sale: any) => {
    setSalesCode(sale.salesCode);
    setSalesDate(new Date(sale.salesDate));
    setSelectedCustomer(sale.customer);
    setSalesman(sale.salesman);
    setGstNumber(sale.gstNumber || "");
    setMobileNumber(sale.mobileNumber || "");

    const rl = await getRateListForCustomer(sale.customer.id);
    setRateList(rl);

    // Resolve MRP for each item directly here using the fresh rl
    const hydratedItems = sale.items.map((item: any) => {
      const match = rl!.items.find(
        (r: any) =>
          r.brandId === item.brandId &&
          r.categoryId === item.categoryId &&
          r.typeId === item.typeId &&
          r.qualityId === item.qualityId,
      );

      let mrp = item.mrp || 0;

      if (match) {
        if (item.salesTypeCode === "FG") {
          mrp = match.nettRate;
        } else if (item.salesTypeCode) {
          const rate = resolveRate({
            salesTypeCode: item.salesTypeCode,
            columns: rl!.columns,
            item: match,
          });
          if (rate !== undefined && rate !== null) mrp = rate;
        }
      }

      const qty = Number(item.qty) || 0;
      const rate = Number(item.rate) || 0;
      const mrpDiff = rate - mrp;

      return {
        ...item,
        mrp,
        mrpDiff,
        diffAmount: mrpDiff * qty,
        amount: qty * rate,
      };
    });

    setItems(hydratedItems);

    setSgst(sale.sgst || 0);
    setCgst(sale.cgst || 0);
    setIgst(sale.igst || 0);
    setFreight(sale.freight || 0);
  };

  // ---------------- CUSTOMER ----------------
  const handleCustomerChange = async (id: string) => {
    const customer = customers.find((c) => c.id === Number(id));

    setSelectedCustomer(customer);
    setSalesman(customer?.salesman || null);

    // ✅ NEW autofill fields
    setGstNumber(customer?.gstNumber || "");
    setMobileNumber(customer?.mobileNumber || "");

    const rl = await getRateListForCustomer(customer.id);
    setRateList(rl);
  };
  // ---------------- ITEMS ----------------
  const addNewRow = () => {
    setItems((prev) => [
      ...prev,
      {
        tempId: Date.now().toString(),
        qty: 0,
        rate: 0,
        amount: 0,
        mrpDiff: 0,
        diffAmount: 0,
        mrp: 0,
      },
    ]);
  };

  const removeRow = (tempId: string) => {
    setItems(items.filter((i) => i.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.tempId !== tempId) return item;

        const updated = { ...item, [field]: value };

        const qty = Number(updated.qty) || 0;
        const rate = Number(updated.rate) || 0;
        const mrp = Number(updated.mrp) || 0;

        // ✅ amount
        updated.amount = qty * rate;

        // ✅ mrp diff
        updated.mrpDiff = rate - mrp;

        // ✅ diff amount
        updated.diffAmount = updated.mrpDiff * qty;

        return updated;
      }),
    );
  };

  // ---------------- RATE LOGIC ----------------
  const handleSelectionChange = async (
    tempId: string,
    field: keyof ItemRow,
    value: any,
  ) => {
    setItems((prev) => {
      const item = prev.find((i) => i.tempId === tempId);
      if (!item || !rateList) return prev;

      const updated = { ...item, [field]: value };

      const match = rateList.items.find(
        (rl: any) =>
          rl.brandId === updated.brandId &&
          rl.categoryId === updated.categoryId &&
          rl.typeId === updated.typeId &&
          rl.qualityId === updated.qualityId,
      );

      const isComplete =
        updated.brandId &&
        updated.categoryId &&
        updated.typeId &&
        updated.qualityId;

      console.log(isComplete, match, updated);

      if (isComplete && match) {
        setTimeout(() => resolveAndUpdateRate(tempId, updated, match), 0);
      }

      return prev.map((i) =>
        i.tempId === tempId ? { ...i, [field]: value } : i,
      );
    });
  };

  const resolveAndUpdateRate = async (
    tempId: string,
    updated: any,
    match: any,
  ) => {
    console.log("updated", updated);
    if (updated.salesTypeCode === "FG") {
      updateItem(tempId, "mrp", match.nettRate);
    } else if (updated.salesTypeCode) {
      const rate = resolveRate({
        salesTypeCode: updated.salesTypeCode,
        columns: rateList.columns,
        item: match,
      });
      if (rate !== undefined && rate !== null) {
        updateItem(tempId, "mrp", rate);
      }
    }

    const old = await getOldSales(
      updated.brandId,
      updated.categoryId,
      updated.typeId,
      updated.qualityId,
    );
    setOldSales(old);
  };
  // ---------------- TOTAL ----------------
  useEffect(() => {
    const total = items.reduce((s, i) => s + (i.amount || 0), 0);
    setSubTotal(total);
  }, [items]);

  useEffect(() => {
    const totalTax = sgst + cgst + igst;
    setNettAmount(Number(subTotal) + Number(totalTax) + Number(freight));
  }, [subTotal, sgst, cgst, igst, freight]);

  useEffect(() => {
    const [_, decimal] = (nettAmount + "").split(".");
    setRoundOff(decimal ? parseFloat("0." + decimal) : 0);
  }, [nettAmount]);

  const calculateTotalTax = () => Number(sgst) + Number(cgst) + Number(igst);

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!selectedCustomer) return toast.error("Select customer");

    const validItems = items.filter((i) => i.qty > 0 && i.rate > 0);
    if (!validItems.length) return toast.error("Add valid items");

    setLoading(true);

    const payload = {
      salesDate,
      customerId: selectedCustomer.id,
      salesmanId: salesman?.id,
      gstNumber,
      mobileNumber,
      sgst: Number(sgst) || 0,
      cgst: Number(cgst) || 0,
      igst: Number(igst) || 0,
      freight: Number(freight) || 0,
      roundOff: Number(roundOff) || 0,
      subTotal,
      totalTax: sgst + cgst + igst,
      nettAmount,
      createdBy: "ADMIN",
      items: validItems,
    };

    try {
      if (isEditing?.status && isEditing?.data?.salesCode) {
        // ✅ UPDATE PATH
        const result = await updateSale(isEditing.data.salesCode, payload);
        if (!result.success) throw new Error(result.error);
        toast.success("Sale updated");
      } else {
        // ✅ CREATE PATH
        await createSale({ salesCode, ...payload });
        toast.success("Sale created");
      }

      handleCancel();
    } catch {
      toast.error(
        isEditing?.status ? "Error updating sale" : "Error creating sale",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedCustomer(null);
    setSalesman(null);
    setItems([]);
    setOldSales([]);
    setRemarks("");
    setSgst(0);
    setCgst(0);
    setIgst(0);
    setFreight(0);
    setRoundOff(0);
    addNewRow();
    setGstNumber("");
    setMobileNumber("");
  };

  const handleSearchView = async () => {
    setViewMode("search");
    setLoading(true);
    try {
      const sales = await setSalesRecords();
    } catch {
      toast.error("Failed to load sales records");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="max-h-[100vh] overflow-auto bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* HEADER */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Sales Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-4">
              {/* Sales Code */}
              <div className="space-y-2">
                <Label htmlFor="salesCode" className="text-sm font-medium">
                  Sales Code
                </Label>
                <Input
                  id="salesCode"
                  value={salesCode}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Sales Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Sales Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !salesDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {salesDate ? (
                        format(salesDate, "dd-MM-yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={salesDate}
                      onSelect={(d) => d && setSalesDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Customer */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="customer" className="text-sm font-medium">
                  Customer Name
                </Label>
                <Select
                  value={selectedCustomer ? String(selectedCustomer.id) : ""}
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Salesman */}
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium">Salesman</Label>
                <Input
                  value={salesman?.salesmanName || ""}
                  disabled
                  placeholder="Autofill after customer selection"
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium">GST Number</Label>
                <Input
                  value={gstNumber}
                  disabled
                  placeholder="Autofill after customer selection"
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium">Mobile Number</Label>
                <Input
                  value={mobileNumber}
                  disabled
                  placeholder="Autofill after customer selection"
                  className="bg-gray-100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ITEMS */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Items</h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-100 hover:bg-yellow-100">
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Sales Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Brand
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Quality
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      Qty
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      Rate
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[130px]">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      MRP
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      MRP Diff
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      Diff Amount
                    </TableHead>

                    <TableHead className="font-semibold text-gray-700 w-[70px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tempId}>
                      {/* Sales Type */}
                      <TableCell className="p-2">
                        <Select
                          value={
                            item.salesTypeId ? String(item.salesTypeId) : ""
                          }
                          onValueChange={(val) => {
                            const st = salesTypes.find(
                              (s) => s.id === Number(val),
                            );
                            updateItem(item.tempId, "salesTypeId", Number(val));
                            updateItem(item.tempId, "salesTypeCode", st?.code);
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                          <SelectContent>
                            {salesTypes.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Brand, Category, Type, Quality */}
                      {(
                        [
                          "typeId",
                          "brandId",
                          "qualityId",
                          "categoryId",
                        ] as const
                      ).map((field) => (
                        <TableCell key={field} className="p-2">
                          <Select
                            value={item[field] ? String(item[field]) : ""}
                            onValueChange={(v) =>
                              handleSelectionChange(
                                item.tempId,
                                field,
                                Number(v),
                              )
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue
                                placeholder={field.replace("Id", "")}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(
                                new Map(
                                  (rateList?.items || []).map((i: any) => [
                                    i[field],
                                    i,
                                  ]),
                                ).values(),
                              ).map((i: any) => (
                                <SelectItem
                                  key={i[field]}
                                  value={String(i[field])}
                                >
                                  {i[field.replace("Id", "Name")]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      ))}

                      {/* Qty */}
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={item.qty || ""}
                          onChange={(e) =>
                            updateItem(
                              item.tempId,
                              "qty",
                              Number(e.target.value),
                            )
                          }
                          placeholder="Quantity"
                          className="h-9"
                        />
                      </TableCell>

                      {/* Rate */}
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={item.rate || ""}
                          onChange={(e) =>
                            updateItem(
                              item.tempId,
                              "rate",
                              Number(e.target.value),
                            )
                          }
                          placeholder="Enter rate"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          value={
                            item.amount ? Number(item.amount).toFixed(2) : ""
                          }
                          disabled
                          placeholder="Auto Calc"
                          className="h-9 bg-gray-100"
                        />
                      </TableCell>

                      <TableCell className="p-2">
                        <Input
                          value={item.mrp ? Number(item.mrp).toFixed(2) : ""}
                          disabled
                          className="bg-gray-100 h-9"
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={
                            item.mrpDiff ? Number(item.mrpDiff).toFixed(2) : ""
                          }
                          disabled
                          className={cn(
                            "h-9",
                            item.mrpDiff < 0
                              ? "bg-red-100 text-red-700 font-semibold"
                              : "bg-gray-100",
                          )}
                        />
                      </TableCell>

                      <TableCell>
                        <Input
                          value={
                            item.diffAmount
                              ? Number(item.diffAmount).toFixed(2)
                              : ""
                          }
                          disabled
                          className="bg-gray-100 h-9"
                        />
                      </TableCell>

                      {/* Amount */}

                      {/* Remove */}
                      <TableCell className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(item.tempId)}
                          className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Button
              onClick={addNewRow}
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </CardContent>
        </Card>

        {/* OLD SALES + FINANCIALS */}
        <div className="grid grid-cols-2 gap-6">
          {/* Old Sales Table */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Old Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Customer Name</TableHead>
                      <TableHead className="text-xs">Sales Date</TableHead>
                      <TableHead className="text-xs">Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oldSales.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center text-gray-500 py-8"
                        >
                          No old sales found
                        </TableCell>
                      </TableRow>
                    ) : (
                      oldSales.map((s: any) => (
                        <TableRow key={s.id}>
                          <TableCell className="text-xs">
                            {s.sales?.customer?.customerName}
                          </TableCell>
                          <TableCell className="text-xs">
                            {s.sales?.salesDate
                              ? format(
                                  new Date(s.sales.salesDate),
                                  "dd-MM-yyyy",
                                )
                              : "-"}
                          </TableCell>
                          <TableCell className="text-xs">₹{s.rate}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Financials */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-sm font-medium">
                    Sales Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks..."
                    className="h-20"
                  />
                </div>

                {/* Financial Grid */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label className="text-sm font-medium">Sub Total</Label>
                    <Input
                      type="number"
                      value={Number(subTotal).toFixed(2)}
                      disabled
                      className="bg-yellow-50 font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">SGST</Label>
                    <Input
                      type="number"
                      value={sgst}
                      onChange={(e) => setSgst(parseFloat(e.target.value) || 0)}
                      placeholder="Numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">CGST</Label>
                    <Input
                      type="number"
                      value={cgst}
                      onChange={(e) => setCgst(parseFloat(e.target.value) || 0)}
                      placeholder="Numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">IGST</Label>
                    <Input
                      type="number"
                      value={igst}
                      onChange={(e) => setIgst(parseFloat(e.target.value) || 0)}
                      placeholder="Numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Total Tax</Label>
                    <Input
                      type="number"
                      value={calculateTotalTax().toFixed(2)}
                      disabled
                      className="bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Freight</Label>
                    <Input
                      type="number"
                      value={freight}
                      onChange={(e) =>
                        setFreight(parseFloat(e.target.value) || 0)
                      }
                      placeholder="Freight"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Round Off</Label>
                    <Input
                      type="number"
                      value={roundOff}
                      disabled
                      placeholder="Round Off"
                    />
                  </div>

                  <div className="space-y-2 col-span-4">
                    <Label className="text-sm font-medium">Nett Amount</Label>
                    <Input
                      type="number"
                      value={Number(nettAmount.toString().split(".")[0])}
                      disabled
                      className="bg-green-50 font-bold text-lg"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading
                      ? "Saving..."
                      : isEditing.status
                        ? "Update"
                        : "Save"}
                  </Button>
                  <Button
                    onClick={handleSearchView}
                    variant="outline"
                    disabled={loading}
                    className="flex-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={loading}
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
