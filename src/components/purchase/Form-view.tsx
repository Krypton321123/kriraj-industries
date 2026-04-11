import { CalendarIcon, Plus, Save, Search, Trash2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { RefreshCcw } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectValue,
} from "../ui/select.tsx";
import ComboboxSupplier from "./combobox-supplier";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import Combobox from "./combobox";
import { Textarea } from "../ui/textarea";
import { useEffect, useState } from "react";
import { Supplier } from "@/actions/masters/supplier/actions";
import {
  createPurchase,
  getBrands,
  getCategories,
  getNextPurchaseCode,
  getOldPurchases,
  getQualities,
  getSuppliers,
  getTypes,
  PurchaseItem,
  getPurchases,
} from "@/actions/purchase/purchase-actions";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAllTaxes, Tax } from "@/actions/tax/actions";

type MasterData = {
  id: number;
  code: string;
  name: string;
  taxes?: string[];
};

type OldPurchase = {
  id: number;
  purchase: {
    supplier: Supplier;
    purchaseDate: Date;
  };
  purchaseRate: number;
  purchaseQty: number;
  brand: { brandName: string };
  category: { categoryName: string };
  type: { typeName: string };
  quality: { qualityName: string };
};

type ItemRow = PurchaseItem & {
  tempId: string;
};

export default function FormView({
  setViewMode,
  setPurchaseRecords,
  suppliers,
}: {
  setViewMode: any;
  setPurchaseRecords: any;
  suppliers: Supplier[];
}) {
  const [purchaseCode, setPurchaseCode] = useState("");
  const [purchaseCategory, setPurchaseCategory] = useState("");
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null,
  );
  const [taxType, setTaxType] = useState<
    "NO_GST" | "GST_STATE" | "GST_CENTRAL"
  >();
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState<MasterData[]>([]);
  const [categories, setCategories] = useState<MasterData[]>([]);
  const [types, setTypes] = useState<MasterData[]>([]);
  const [qualities, setQualities] = useState<MasterData[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [oldPurchases, setOldPurchases] = useState<OldPurchase[]>([]);
  const [remarks, setRemarks] = useState("");
  const [taxes, setTaxes] = useState<Tax[]>([]);

  const [subTotal, setSubTotal] = useState(0);
  const [sgst, setSgst] = useState(0);
  const [cgst, setCgst] = useState(0);
  const [igst, setIgst] = useState(0);
  const [freight, setFreight] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [nettAmount, setNettAmount] = useState(0);

  const refreshMasters = async () => {
    try {
      setLoading(true);

      const [brandsRes, categoriesRes, typesRes, qualitiesRes] =
        await Promise.all([
          getBrands(),
          getCategories(),
          getTypes(),
          getQualities(),
        ]);

      if (brandsRes.success && brandsRes.data) {
        setBrands(
          brandsRes.data.map((b: any) => ({
            id: b.id,
            code: b.brandCode,
            name: b.brandName,
            taxes: (b.taxes || []).map((t: any) => t.taxId),
          })),
        );
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(
          categoriesRes.data.map((c: any) => ({
            id: c.id,
            code: c.categoryCode,
            name: c.categoryName,
            taxes: (c.taxes || []).map((t: any) => t.taxId),
          })),
        );
      }

      if (typesRes.success && typesRes.data) {
        setTypes(
          typesRes.data.map((t: any) => ({
            id: t.id,
            code: t.typeCode,
            name: t.typeName,
            taxes: (t.taxes || []).map((x: any) => x.taxId),
          })),
        );
      }

      if (qualitiesRes.success && qualitiesRes.data) {
        setQualities(
          qualitiesRes.data.map((q: any) => ({
            id: q.id,
            code: q.qualityCode,
            name: q.qualityName,
            taxes: (q.taxes || []).map((x: any) => x.taxId),
          })),
        );
      }

      toast.success("Master data refreshed");
    } catch (err) {
      toast.error("Failed to refresh master data");
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = async (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === parseInt(supplierId));
    setSelectedSupplier(supplier || null);
  };

  const applyTax = () => {
    if (!selectedTax || !taxType) return;

    if (taxType === "NO_GST") {
      setSgst(0);
      setCgst(0);
      setIgst(0);
      return;
    }

    if (taxType === "GST_STATE") {
      const sgstAmount = (subTotal * selectedTax.sgst) / 100;
      const cgstAmount = (subTotal * selectedTax.cgst) / 100;

      setSgst(sgstAmount);
      setCgst(cgstAmount);
      setIgst(0);
    }

    if (taxType === "GST_CENTRAL") {
      const igstAmount = (subTotal * selectedTax.igst) / 100;

      setIgst(igstAmount);
      setSgst(0);
      setCgst(0);
    }
  };
  useEffect(() => {
    applyTax();
  }, [selectedTax, taxType, subTotal]);

  const handleMasterDataChange = async (
    tempId: string,
    field: "brandId" | "categoryId" | "typeId" | "qualityId",
    value: string,
  ) => {
    updateItem(tempId, field, parseInt(value));

    // Get current item values
    const item = items.find((i) => i.tempId === tempId);
    if (!item) return;

    const updatedItem = { ...item, [field]: parseInt(value) };

    // Fetch old purchases if all four fields are filled
    if (
      updatedItem.brandId &&
      updatedItem.categoryId &&
      updatedItem.typeId &&
      updatedItem.qualityId
    ) {
      const result = await getOldPurchases(
        updatedItem.brandId,
        updatedItem.categoryId,
        updatedItem.typeId,
        updatedItem.qualityId,
      );

      if (result.success && result.data) {
        setOldPurchases(result.data);
      }
    }
  };

  useEffect(() => {
    const load = async () => {
      const data = await getAllTaxes();
      setTaxes(data);
    };
    load();
  }, []);

  const addNewRow = () => {
    const newRow: ItemRow = {
      tempId: Date.now().toString(),
      brandId: 0,
      categoryId: 0,
      typeId: 0,
      qualityId: 0,
      purchaseQty: 0,
      purchaseAmount: 0,
      purchaseRate: 0,
    };
    setItems([...items, newRow]);
  };

  useEffect(() => {
    const total = items.reduce(
      (sum, item) => sum + (item.purchaseAmount || 0),
      0,
    );
    setSubTotal(total);
  }, [items]);

  const calculateTotalTax = () => {
    return sgst + cgst + igst;
  };

  const calculateNettAmount = () => {
    const totalTax = calculateTotalTax();
    return setNettAmount(subTotal + totalTax + freight);
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    setNettAmount(calculateTotalTax() + freight + subTotal);
  }, [igst, cgst, sgst, subTotal]);

  useEffect(() => {
    const [amount, roundOff] = (nettAmount + "").split(".");
    console.log(calculateNettAmount());
    if (roundOff) {
      setRoundOff(parseFloat("." + roundOff));
    } else {
      setRoundOff(0.0);
    }
  }, [nettAmount]);

  const handleSubmit = async () => {
    // Validation

    if (!selectedSupplier) {
      toast.error("Please select a supplier");
      return;
    }

    const validItems = items.filter(
      (item) =>
        item.brandId &&
        item.categoryId &&
        item.typeId &&
        item.qualityId &&
        item.purchaseQty > 0,
    );

    if (validItems.length === 0) {
      toast("Please add at least one valid item");
      return;
    }

    setLoading(true);
    console.log(purchaseCategory);
    try {
      const formData = {
        supplierId: selectedSupplier.id,
        purchaseDate,
        purchaseCategory,
        items: validItems.map((item) => ({
          brandId: item.brandId,
          categoryId: item.categoryId,
          typeId: item.typeId,
          qualityId: item.qualityId,
          purchaseQty: item.purchaseQty,
          purchaseAmount: item.purchaseAmount,
          purchaseRate: item.purchaseRate,
        })),
        subTotal,
        sgst,
        cgst,
        igst,
        totalTax: calculateTotalTax(),
        freight,
        roundOff,
        nettAmount: nettAmount,
        remarks,
        createdBy: "ADMIN", // Replace with actual user
      };

      const result = await createPurchase(formData);

      if (result.success) {
        toast("Purchase created successfully");
        handleCancel();
      } else {
        toast(result.error || "Failed to create purchase");
      }
    } catch (error) {
      toast("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setSelectedSupplier(null);
    setPurchaseDate(new Date());
    setItems([]);
    setOldPurchases([]);
    setRemarks("");
    setSgst(0);
    setCgst(0);
    setIgst(0);
    setFreight(0);
    setRoundOff(0);
    addNewRow();
    loadInitialData();
  };

  const handleSearchView = async () => {
    setViewMode("search");
    setLoading(true);
    try {
      const purchases = await getPurchases();
      console.log("purchases", purchases);
      setPurchaseRecords(purchases.data);
    } catch (error) {
      toast("Failed to load purchase records");
    } finally {
      setLoading(false);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [codeRes, brandsRes, categoriesRes, typesRes, qualitiesRes] =
        await Promise.all([
          getNextPurchaseCode(),
          getBrands(),
          getCategories(),
          getTypes(),
          getQualities(),
        ]);

      console.log("brands", brandsRes);

      if (codeRes.success && codeRes.purchaseCode) {
        setPurchaseCode(codeRes.purchaseCode);
      }

      if (brandsRes.success && brandsRes.data) {
        setBrands(
          brandsRes.data.map((b: any) => ({
            id: b.id,
            code: b.brandCode,
            name: b.brandName,
            taxes: (b.taxes || []).map((t: any) => t.taxId),
          })),
        );
      }

      if (categoriesRes.success && categoriesRes.data) {
        setCategories(
          categoriesRes.data.map((c: any) => ({
            id: c.id,
            code: c.categoryCode,
            name: c.categoryName,
            taxes: (c.taxes || []).map((t: any) => t.taxId), // 🔥 ADD THIS
          })),
        );
      }

      if (typesRes.success && typesRes.data) {
        setTypes(
          typesRes.data.map((t: any) => ({
            id: t.id,
            code: t.typeCode,
            name: t.typeName,
            taxes: (t.taxes || []).map((x: any) => x.taxId), // 🔥 ADD
          })),
        );
      }

      if (qualitiesRes.success && qualitiesRes.data) {
        setQualities(
          qualitiesRes.data.map((q: any) => ({
            id: q.id,
            code: q.qualityCode,
            name: q.qualityName,
            taxes: (q.taxes || []).map((x: any) => x.taxId), // 🔥 ADD
          })),
        );
      }

      // Add initial empty row
      addNewRow();
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const removeRow = (tempId: string) => {
    setItems(items.filter((item) => item.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof ItemRow, value: any) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        if (item.tempId === tempId) {
          const updatedItem = { ...item, [field]: value };

          // Auto-calculate rate when qty and amount are present
          if (field === "purchaseQty" || field === "purchaseAmount") {
            const qty =
              field === "purchaseQty"
                ? parseFloat(value) || 0
                : item.purchaseQty;
            const amount =
              field === "purchaseAmount"
                ? parseFloat(value) || 0
                : item.purchaseAmount;

            if (qty > 0) {
              updatedItem.purchaseRate = amount / qty;
            }
          }

          return updatedItem;
        }
        return item;
      });

      return updatedItems;
    });
  };

  return (
    <div className="max-h-[100vh] overflow-auto bg-gray-50 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Purchase Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {/* Purchase Code */}
              <div className="space-y-2">
                <Label htmlFor="purchaseCode" className="text-sm font-medium">
                  Purchase Code
                </Label>
                <Input
                  id="purchaseCode"
                  value={purchaseCode}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {/* Purchase Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Purchase Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !purchaseDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? (
                        format(purchaseDate, "dd-MM-yyyy")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={purchaseDate}
                      onSelect={(date) => date && setPurchaseDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Supplier Name */}
              <div className="space-y-2 col-span-2">
                <Label htmlFor="supplier" className="text-sm font-medium">
                  Supplier Name
                </Label>
                <ComboboxSupplier
                  data={suppliers}
                  setSelected={handleSupplierChange}
                  selectedId={selectedSupplier?.id}
                />
              </div>

              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium">Purchase Category</Label>
                <Select
                  onValueChange={(value) => {
                    setPurchaseCategory(value);

                    const tax = taxes.find((t) => t.taxId === value) || null;
                    setSelectedTax(tax);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Choose a category</SelectLabel>

                      {taxes.map((tax) => (
                        <SelectItem key={tax.taxId} value={tax.taxId}>
                          {tax.comName}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* Tax Type */}
              <div className="space-y-2 col-span-2">
                <Label className="text-sm font-medium">Tax Type</Label>
                <Select onValueChange={(value) => setTaxType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Choose Tax Type</SelectLabel>
                      <SelectItem value="NO_GST">No GST</SelectItem>
                      <SelectItem value="GST_STATE">
                        GST (State - CGST + SGST)
                      </SelectItem>
                      <SelectItem value="GST_CENTRAL">
                        GST (Central - IGST)
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {/* GST Number */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">GST No.</Label>
                <Input
                  value={selectedSupplier?.gstNumber || ""}
                  disabled
                  placeholder="Autofill after supplier selection"
                  className="bg-gray-100"
                />
              </div>

              {/* Mobile */}
              <div className="space-y-2 col-span-3">
                <Label className="text-sm font-medium">Mobile</Label>
                <div className="flex gap-2">
                  <Input
                    value={selectedSupplier?.mobileNumber || ""}
                    disabled
                    placeholder="Autofill after supplier's Balance"
                    className="bg-gray-100"
                  />

                  <Label className="text-sm font-medium">Opening Balance</Label>
                  <Input
                    value={selectedSupplier?.openingBalance || ""}
                    disabled
                    placeholder="Autofill after supplier selection"
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Items</h3>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshMasters}
                disabled={loading}
                className="flex items-center gap-2 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh Masters
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-100 hover:bg-yellow-100">
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Brand
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Category
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Quality
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      Purchase Qty
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[130px]">
                      Purchase Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[120px]">
                      Purchase Rate
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[70px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tempId}>
                      <TableCell className="p-2">
                        <Combobox
                          tempId={item.tempId}
                          data={brands.filter(
                            (b) =>
                              !purchaseCategory ||
                              b.taxes?.includes(purchaseCategory),
                          )}
                          group={"brandId"}
                          setFunc={handleMasterDataChange}
                          selectedId={item.brandId || undefined}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Combobox
                          tempId={item.tempId}
                          data={categories.filter(
                            (c) =>
                              !purchaseCategory ||
                              c.taxes?.includes(purchaseCategory),
                          )}
                          group={"categoryId"}
                          setFunc={handleMasterDataChange}
                          selectedId={item.categoryId || undefined}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Combobox
                          tempId={item.tempId}
                          data={types.filter(
                            (t) =>
                              !purchaseCategory ||
                              t.taxes?.includes(purchaseCategory),
                          )}
                          group={"typeId"}
                          setFunc={handleMasterDataChange}
                          selectedId={item.typeId || undefined}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Combobox
                          tempId={item.tempId}
                          data={qualities.filter(
                            (q) =>
                              !purchaseCategory ||
                              q.taxes?.includes(purchaseCategory),
                          )}
                          group={"qualityId"}
                          setFunc={handleMasterDataChange}
                          selectedId={item.qualityId || undefined}
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={item.purchaseQty || ""}
                          onChange={(e) =>
                            updateItem(
                              item.tempId,
                              "purchaseQty",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="Quantity of purchase"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={item.purchaseAmount || ""}
                          onChange={(e) =>
                            updateItem(
                              item.tempId,
                              "purchaseAmount",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          placeholder="Decimal"
                          className="h-9"
                        />
                      </TableCell>
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={
                            item.purchaseRate
                              ? item.purchaseRate.toFixed(2)
                              : ""
                          }
                          disabled
                          placeholder="Auto Calc"
                          className="h-9 bg-gray-100"
                        />
                      </TableCell>
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

        <div className="grid grid-cols-2 gap-6">
          {/* Old Purchases Table */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Old Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="text-xs">Supplier Name</TableHead>
                      <TableHead className="text-xs">Mobile No.</TableHead>
                      <TableHead className="text-xs">Purchase Date</TableHead>
                      <TableHead className="text-xs">Purchase Rate</TableHead>
                      <TableHead className="text-xs">
                        Diff. From Curr. Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {oldPurchases.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center text-gray-500 py-8"
                        >
                          No old purchases found
                        </TableCell>
                      </TableRow>
                    ) : (
                      oldPurchases.map((purchase: any) => {
                        const currentRate =
                          items.find(
                            (item) =>
                              item.brandId === purchase.brand?.id &&
                              item.categoryId === purchase.category?.id &&
                              item.typeId === purchase.type?.id &&
                              item.qualityId === purchase.quality?.id,
                          )?.purchaseRate || 0;
                        const diff = currentRate - purchase.purchaseRate;

                        return (
                          <TableRow key={purchase.id}>
                            <TableCell className="text-xs">
                              {purchase.purchase.supplier.supplierName}
                            </TableCell>
                            <TableCell className="text-xs">
                              {purchase.purchase.supplier.mobileNumber}
                            </TableCell>
                            <TableCell className="text-xs">
                              {format(
                                new Date(purchase.purchase.purchaseDate),
                                "dd-MM-yyyy",
                              )}
                            </TableCell>
                            <TableCell className="text-xs">
                              ₹{purchase.purchaseRate}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "text-xs font-medium",
                                diff > 0 ? "text-green-600" : "text-red-600",
                              )}
                            >
                              {diff > 0 ? "+" : ""}₹{diff.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Financials Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Purchase Remarks */}
                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-sm font-medium">
                    Purchase Remarks
                  </Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => {
                      setRemarks(e.target.value);
                    }}
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
                      value={subTotal.toFixed(2)}
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
                      type="text"
                      value={igst.toString()}
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
                    <Label className="text-sm font-medium">
                      Other Expenses - Freight
                    </Label>
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
                      disabled={true}
                      value={roundOff}
                      onChange={(e) =>
                        setRoundOff(parseFloat(e.target.value) || 0)
                      }
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
                    {loading ? "Saving..." : "Save"}
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
