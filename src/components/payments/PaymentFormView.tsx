"use client";

import {
  CalendarIcon,
  Plus,
  Save,
  Search,
  Trash2,
  X,
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
  getLedgersByMode,
  getExpenses,
  getNextPaymentCode,
  createPayment,
  updatePayment,
  getPaymentByCode,
} from "@/actions/payments/actions";

type ItemRow = {
  tempId: string;
  expenseId?: string;
  expenseName?: string;
  receiptLedgerId?: number;
  receiptLedgers: { id: number; ledgerName: string }[];
  amount: number;
  remarks: string;
};

export default function PaymentFormView({
  setViewMode,
  setPaymentRecords,
  isEditing,
}: any) {
  const [paymentCode, setPaymentCode] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [paymentMode, setPaymentMode] = useState<"CASH" | "BANK" | "">("");
  const [paymentLedgers, setPaymentLedgers] = useState<any[]>([]);
  const [paymentLedgerId, setPaymentLedgerId] = useState<number | null>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  // ── INIT ──
  useEffect(() => {
    const load = async () => {
      const [expData, codeData] = await Promise.all([
        getExpenses(),
        getNextPaymentCode(),
      ]);
      setExpenses(expData);
      setPaymentCode(codeData?.paymentCode || "");
      addNewRow();
    };
    load();
  }, []);

  // ── EDIT MODE ──
  useEffect(() => {
    if (!isEditing?.status || !isEditing?.data?.paymentCode) return;

    const load = async () => {
      const payment = await getPaymentByCode(isEditing.data.paymentCode);
      if (!payment) return;

      setPaymentCode(payment.paymentCode);
      setPaymentDate(new Date(payment.paymentDate));
      setPaymentMode(payment.paymentMode as "CASH" | "BANK");
      setRemarks(payment.remarks);
      setPaymentLedgerId(payment.paymentLedgerId);

      // Load ledgers for this mode
      const ledgers = await getLedgersByMode(payment.paymentMode as "CASH" | "BANK");
      setPaymentLedgers(ledgers);

      setItems(
        payment.items.map((item: any) => ({
          tempId: item.tempId,
          expenseId: item.expenseId.toString(),
          expenseName: item.expenseName,
          receiptLedgerId: item.receiptLedgerId,
          receiptLedgers: item.receiptLedgers,
          amount: item.amount,
          remarks: item.remarks,
        }))
      );
    };

    load();
  }, [isEditing]);

  // ── PAYMENT MODE CHANGE ──
  const handleModeChange = async (mode: "CASH" | "BANK") => {
    setPaymentMode(mode);
    setPaymentLedgerId(null);
    const ledgers = await getLedgersByMode(mode);
    setPaymentLedgers(ledgers);
  };

  // ── ITEMS ──
  const addNewRow = () => {
    setItems((prev) => [
      ...prev,
      {
        tempId: Date.now().toString(),
        receiptLedgers: [],
        amount: 0,
        remarks: "",
      },
    ]);
  };

  const removeRow = (tempId: string) => {
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));
  };

  const updateItem = (tempId: string, field: keyof ItemRow, value: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId ? { ...item, [field]: value } : item
      )
    );
  };

  // When expense changes, load receipt ledgers for that expense's parent group
  const handleExpenseChange = (tempId: string, expenseId: string) => {
    const expense = expenses.find((e) => e.id.toString() === expenseId);
    if (!expense) return;

    setItems((prev) =>
      prev.map((item) =>
        item.tempId === tempId
          ? {
              ...item,
              expenseId,
              expenseName: expense.expenseName,
              receiptLedgerId: undefined,
              receiptLedgers: expense.receiptLedgers || [],
            }
          : item
      )
    );
  };

  // ── TOTAL ──
  useEffect(() => {
    const total = items.reduce((s, i) => s + (Number(i.amount) || 0), 0);
    setTotalAmount(total);
  }, [items]);

  // ── SUBMIT ──
  const handleSubmit = async () => {
    if (!paymentMode) return toast.error("Select payment mode");
    if (!paymentLedgerId) return toast.error("Select payment ledger");

    const validItems = items.filter(
      (i) => i.expenseId && i.receiptLedgerId && Number(i.amount) > 0
    );
    if (!validItems.length) return toast.error("Add at least one valid item");

    setLoading(true);

    const payload = {
      paymentDate,
      paymentMode,
      paymentLedgerId,
      totalAmount,
      remarks,
      createdBy: "ADMIN",
      items: validItems.map((i) => ({
        expenseId: i.expenseId,
        receiptLedgerId: i.receiptLedgerId,
        amount: i.amount,
        remarks: i.remarks,
      })),
    };

    try {
      if (isEditing?.status && isEditing?.data?.paymentCode) {
        const result = await updatePayment(isEditing.data.paymentCode, payload);
        if (!result.success) throw new Error(result.error);
        toast.success("Payment updated");
      } else {
        const result = await createPayment({ paymentCode, ...payload });
        if (!result.success) throw new Error(result.error);
        toast.success("Payment created");
      }
      handleCancel();
    } catch {
      toast.error(isEditing?.status ? "Error updating payment" : "Error creating payment");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPaymentMode("");
    setPaymentLedgerId(null);
    setPaymentLedgers([]);
    setItems([]);
    setRemarks("");
    setTotalAmount(0);
    addNewRow();
  };

  const handleSearchView = async () => {
    setViewMode("search");
    setLoading(true);
    try {
      await setPaymentRecords();
    } catch {
      toast.error("Failed to load payment records");
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──
  return (
    <div className="max-h-[100vh] overflow-auto bg-gray-50 p-6">
      <div className="max-w-[1400px] mx-auto space-y-6">

        {/* ── HEADER ── */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Payment Entry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {/* Payment Code */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Code</Label>
                <Input value={paymentCode} disabled className="bg-gray-100" />
              </div>

              {/* Payment Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !paymentDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {paymentDate ? format(paymentDate, "dd-MM-yyyy") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={paymentDate}
                      onSelect={(d) => d && setPaymentDate(d)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Payment Mode */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Mode</Label>
                <Select
                  value={paymentMode}
                  onValueChange={(v) => handleModeChange(v as "CASH" | "BANK")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Cash or Bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment Ledger */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Ledger</Label>
                <Select
                  value={paymentLedgerId ? String(paymentLedgerId) : ""}
                  onValueChange={(v) => setPaymentLedgerId(Number(v))}
                  disabled={!paymentMode}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        paymentMode
                          ? "Select ledger"
                          : "Select mode first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentLedgers.map((l) => (
                      <SelectItem key={l.id} value={String(l.id)}>
                        {l.ledgerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── ITEMS GRID ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                Payment Items
              </h3>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-yellow-100 hover:bg-yellow-100">
                    <TableHead className="font-semibold text-gray-700 w-[250px]">
                      Payment For (Expense)
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[250px]">
                      Receipt Ledger
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[150px]">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Remark
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 w-[70px]">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.tempId}>
                      {/* Expense */}
                      <TableCell className="p-2">
                        <Select
                          value={item.expenseId || ""}
                          onValueChange={(v) =>
                            handleExpenseChange(item.tempId, v)
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select expense" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenses.map((e) => (
                              <SelectItem key={e.id} value={String(e.id)}>
                                {e.expenseName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Receipt Ledger */}
                      <TableCell className="p-2">
                        <Select
                          value={
                            item.receiptLedgerId
                              ? String(item.receiptLedgerId)
                              : ""
                          }
                          onValueChange={(v) =>
                            updateItem(item.tempId, "receiptLedgerId", Number(v))
                          }
                          disabled={!item.expenseId || item.receiptLedgers.length === 0}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue
                              placeholder={
                                item.expenseId
                                  ? item.receiptLedgers.length === 0
                                    ? "No ledgers available"
                                    : "Select ledger"
                                  : "Select expense first"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {item.receiptLedgers.map((l) => (
                              <SelectItem key={l.id} value={String(l.id)}>
                                {l.ledgerName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="p-2">
                        <Input
                          type="number"
                          value={item.amount || ""}
                          onChange={(e) =>
                            updateItem(
                              item.tempId,
                              "amount",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0.00"
                          className="h-9"
                        />
                      </TableCell>

                      {/* Remark */}
                      <TableCell className="p-2">
                        <Input
                          value={item.remarks || ""}
                          onChange={(e) =>
                            updateItem(item.tempId, "remarks", e.target.value)
                          }
                          placeholder="Optional remark"
                          className="h-9"
                        />
                      </TableCell>

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

        {/* ── FOOTER / TOTALS ── */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Remarks */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Remarks</Label>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks..."
                  className="h-20"
                />
              </div>

              {/* Total */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Total Amount</Label>
                  <Input
                    value={totalAmount.toFixed(2)}
                    disabled
                    className="bg-green-50 font-bold text-lg"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Saving..." : isEditing?.status ? "Update" : "Save"}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}