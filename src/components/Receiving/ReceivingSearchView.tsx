"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, ArrowLeft, Eye, Printer, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Types ───────────────────────────────────────────────────────────────────
type ReceivingItem = {
  id: number;
  income: { id: string; incomeName: string; incomeCode: string };
  receiptLedger: { id: number; ledgerName: string };
  amount: number;
  remarks: string;
};

type ReceivingRecord = {
  id: number;
  receivingCode: string;
  receivingDate: Date;
  paymentMode: string;
  paymentLedger: { id: number; ledgerName: string };
  totalAmount: number;
  remarks: string;
  createdBy: string;
  itemCount: number;
  items?: ReceivingItem[];
};

// ─── Number to Words ─────────────────────────────────────────────────────────
function numberToWords(num: number): string {
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
    "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
    "Sixteen", "Seventeen", "Eighteen", "Nineteen",
  ];
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety",
  ];

  function below1000(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
    return ones[Math.floor(n / 100)] + " Hundred " + below1000(n % 100);
  }

  const integer = Math.floor(num);
  if (integer === 0) return "Zero";
  let result = "";
  if (integer >= 10000000)
    result += below1000(Math.floor(integer / 10000000)) + "Crore ";
  if (integer % 10000000 >= 100000)
    result += below1000(Math.floor((integer % 10000000) / 100000)) + "Lakh ";
  if (integer % 100000 >= 1000)
    result += below1000(Math.floor((integer % 100000) / 1000)) + "Thousand ";
  result += below1000(integer % 1000);
  return result.trim() + " Only";
}

// ─── Print Receipt Voucher ───────────────────────────────────────────────────
function printReceiptVoucher(record: ReceivingRecord) {
  const items = record.items || [];

  const voucherHTML = `
    <div style="width:210mm;margin:0 auto;padding:10mm;font-family:Arial,sans-serif;font-size:11px;color:#000;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border:2px solid #000;padding:8px 10px;">
        <div>
          <h1 style="font-size:20px;font-weight:bold;letter-spacing:1px;margin:0;">YOUR COMPANY NAME</h1>
          <p style="font-size:10px;color:#555;margin:2px 0;">(Traders of Auto Parts)</p>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16px;font-weight:bold;margin:0;">RECEIPT VOUCHER</h2>
          <p style="font-size:10px;margin:2px 0;color:#555;">${record.paymentMode === "CASH" ? "Cash Receipt" : "Bank Receipt"}</p>
        </div>
      </div>

      <!-- Meta -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;">
        <tr>
          <td style="width:50%;border-right:1px solid #000;padding:6px 8px;font-size:10px;vertical-align:top;">
            <table style="width:100%;line-height:1.8;">
              <tr>
                <td style="font-weight:bold;width:130px;">Voucher No.</td>
                <td>: ${record.receivingCode}</td>
              </tr>
              <tr>
                <td style="font-weight:bold;">Date</td>
                <td>: ${format(new Date(record.receivingDate), "dd-MM-yyyy")}</td>
              </tr>
              <tr>
                <td style="font-weight:bold;">Receipt Mode</td>
                <td>: ${record.paymentMode}</td>
              </tr>
            </table>
          </td>
          <td style="width:50%;padding:6px 8px;font-size:10px;vertical-align:top;">
            <table style="width:100%;line-height:1.8;">
              <tr>
                <td style="font-weight:bold;width:130px;">Receipt Ledger</td>
                <td>: ${record.paymentLedger.ledgerName}</td>
              </tr>
              <tr>
                <td style="font-weight:bold;">Created By</td>
                <td>: ${record.createdBy}</td>
              </tr>
              ${record.remarks ? `<tr><td style="font-weight:bold;">Remarks</td><td>: ${record.remarks}</td></tr>` : ""}
            </table>
          </td>
        </tr>
      </table>

      <!-- Items -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:center;width:6%;">Sr.</th>
            <th style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:left;width:30%;">Payment For (Income)</th>
            <th style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:left;width:30%;">Receipt Ledger</th>
            <th style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:right;width:18%;">Amount (₹)</th>
            <th style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:left;width:16%;">Remark</th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length > 0
              ? items
                  .map(
                    (item, idx) => `
              <tr>
                <td style="border:1px solid #000;padding:4px 6px;font-size:10px;text-align:center;">${idx + 1}</td>
                <td style="border:1px solid #000;padding:4px 6px;font-size:10px;">${item.income?.incomeName || "-"}</td>
                <td style="border:1px solid #000;padding:4px 6px;font-size:10px;">${item.receiptLedger?.ledgerName || "-"}</td>
                <td style="border:1px solid #000;padding:4px 6px;font-size:10px;text-align:right;">${Number(item.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                <td style="border:1px solid #000;padding:4px 6px;font-size:10px;">${item.remarks || "-"}</td>
              </tr>
            `
                  )
                  .join("")
              : `<tr><td colspan="5" style="border:1px solid #000;padding:10px;text-align:center;font-size:10px;">No items</td></tr>`
          }
          <tr style="font-weight:bold;background:#f9f9f9;">
            <td colspan="3" style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:right;">TOTAL</td>
            <td style="border:1px solid #000;padding:5px 6px;font-size:10px;text-align:right;">
              ${record.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </td>
            <td style="border:1px solid #000;padding:5px 6px;"></td>
          </tr>
        </tbody>
      </table>

      <!-- Amount in Words -->
      <div style="border:1px solid #000;border-top:none;padding:5px 8px;font-size:10px;">
        <span style="font-weight:bold;">Amount in Words: </span>
        Rupees ${numberToWords(record.totalAmount)}
      </div>

      <!-- Signatures -->
      <div style="display:flex;border:1px solid #000;border-top:none;">
        <div style="flex:1;border-right:1px solid #000;padding:6px 8px;font-size:10px;text-align:center;">
          <div style="height:50px;"></div>
          <p style="border-top:1px solid #000;padding-top:4px;margin-top:4px;">Prepared By</p>
        </div>
        <div style="flex:1;border-right:1px solid #000;padding:6px 8px;font-size:10px;text-align:center;">
          <div style="height:50px;"></div>
          <p style="border-top:1px solid #000;padding-top:4px;margin-top:4px;">Checked By</p>
        </div>
        <div style="flex:1;padding:6px 8px;font-size:10px;text-align:center;">
          <div style="height:50px;"></div>
          <p style="border-top:1px solid #000;padding-top:4px;margin-top:4px;">Authorised Signatory</p>
        </div>
      </div>
    </div>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt Voucher - ${record.receivingCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #fff; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${voucherHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
}

// ─── Main Component ──────────────────────────────────────────────────────────
type SearchViewProps = {
  receivingRecords: ReceivingRecord[];
  incomes: any[];
  loading: boolean;
  onBackToForm: () => void;
  setEditing: any;
};

export default function ReceivingSearchView({
  receivingRecords,
  incomes,
  loading,
  onBackToForm,
  setEditing,
}: SearchViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [incomeFilter, setIncomeFilter] = useState<string>("all");

  const filteredRecords = Array.isArray(receivingRecords)
    ? receivingRecords.filter((record) => {
        const matchesSearch =
          searchQuery === "" ||
          record.receivingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.paymentLedger.ledgerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesDate =
          !dateFilter ||
          format(new Date(record.receivingDate), "yyyy-MM-dd") ===
            format(dateFilter, "yyyy-MM-dd");

        const matchesMode =
          modeFilter === "all" || record.paymentMode === modeFilter;

        const matchesIncome =
          incomeFilter === "all" ||
          record.items?.some(
            (item) => item.income?.id?.toString() === incomeFilter
          );

        return matchesSearch && matchesDate && matchesMode && matchesIncome;
      })
    : [];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToForm}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Form
                </Button>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Receiving Records
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by code or ledger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "dd-MM-yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateFilter}
                      onSelect={setDateFilter}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Mode */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Mode</Label>
                <Select value={modeFilter} onValueChange={setModeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Income filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Income</Label>
                <Select value={incomeFilter} onValueChange={setIncomeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All incomes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {incomes.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.incomeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(searchQuery || dateFilter || modeFilter !== "all" || incomeFilter !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDateFilter(undefined);
                  setModeFilter("all");
                  setIncomeFilter("all");
                }}
                className="mt-4 text-sm"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Receiving Code</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Mode</TableHead>
                    <TableHead className="font-semibold">Payment Ledger</TableHead>
                    <TableHead className="font-semibold text-right">Total Amount</TableHead>
                    <TableHead className="font-semibold text-center">Items</TableHead>
                    <TableHead className="font-semibold">Created By</TableHead>
                    <TableHead className="font-semibold text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900" />
                          <span>Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No receiving records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{record.receivingCode}</TableCell>
                        <TableCell>{format(new Date(record.receivingDate), "dd-MM-yyyy")}</TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              record.paymentMode === "CASH"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                            )}
                          >
                            {record.paymentMode}
                          </span>
                        </TableCell>
                        <TableCell>{record.paymentLedger?.ledgerName || "-"}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{record.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {record.itemCount}
                          </span>
                        </TableCell>
                        <TableCell>{record.createdBy}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="Edit"
                              onClick={() => {
                                setEditing({ data: record, status: true });
                                onBackToForm();
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Print Voucher"
                              onClick={() => printReceiptVoucher(record)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {!loading && filteredRecords.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredRecords.length} of {receivingRecords.length} records
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}