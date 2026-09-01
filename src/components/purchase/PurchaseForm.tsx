"use client";
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Search, ArrowLeft, Eye, Printer } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import { getSuppliers } from "@/actions/purchase/purchase-actions";
import ComboboxSupplier from "./combobox-supplier";
import FormView from "./Form-view";

type Supplier = {
  id: number;
  supplierCode: string;
  supplierName: string;
  supplierAddress: string;
  city: string;
  state: string;
  mobileNumber: string;
  gstNumber: string;
  openingBalance: string;
};

type PurchaseItem = {
  id: number;
  brand?: { brandName: string };
  category?: { categoryName: string };
  type?: { typeName: string };
  quality?: { qualityName: string };
  purchaseQty: number;
  purchaseRate: number;
  purchaseAmount: number;
};

type PurchaseRecord = {
  id: number;
  purchaseCode: string;
  purchaseDate: Date;
  supplier: Supplier;
  subTotal: number;
  totalTax: number;
  nettAmount: number;
  remarks: string;
  createdBy: string;
  itemCount: number;
  items?: PurchaseItem[];
  companyName?: string;
  companyAddress?: string;
  companyGstin?: string;
  companyPan?: string;
  companyContact?: string;
  companyStateCode?: string;
  placeOfSupply?: string;
  vehicleNo?: string;
  transporterName?: string;
  bankName?: string;
  accountNo?: string;
  ifscCode?: string;
};

// ─── Number to Words (Indian system) ───────────────────────────────────────
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function below1000(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100)
      return (
        tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " "
      );
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

// ─── Print Invoice Logic ────────────────────────────────────────────────────
function printInvoice(
  record: PurchaseRecord,
  copyType = "Original for Recipient",
) {
  const items: PurchaseItem[] = record.items || [];
  console.log(record.items);
  const totalQty = items.reduce((sum, i) => sum + Number(i.purchaseQty), 0);

  const companyName = record.companyName || "YOUR COMPANY NAME";
  const companyAddress = record.companyAddress || "Your Address Here";
  const companyGstin = record.companyGstin || "GSTIN";
  const companyPan = record.companyPan || "PAN";
  const companyContact = record.companyContact || "";
  const companyStateCode = record.companyStateCode || "09";
  const placeOfSupply = record.placeOfSupply || record.supplier.state;
  const vehicleNo = record.vehicleNo || "-";
  const transporterName = record.transporterName || "-";
  const bankName = record.bankName || "-";
  const accountNo = record.accountNo || "-";
  const ifscCode = record.ifscCode || "-";

  const invoiceHTML = `
    <div style="position:relative;width:210mm;margin:0 auto;padding:6mm;font-family:Arial,sans-serif;font-size:11px;color:#000;">
      <!-- Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border:1px solid #000;padding:6px 8px 4px;">
        <div style="flex:1;">
          <h1 style="font-size:20px;font-weight:bold;letter-spacing:1px;margin:0;">${companyName}</h1>
          <p style="font-size:10px;color:#555;margin:2px 0;">(Traders of Auto Parts)</p>
          <div style="margin-top:4px;font-size:10px;line-height:1.5;">
            <p>Address : ${companyAddress}</p>
            ${companyContact ? `<p>Contact No : ${companyContact}</p>` : ""}
            <p>State Code/Name : ${companyStateCode}</p>
          </div>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16px;font-weight:bold;margin:0;">TAX INVOICE</h2>
          <p style="font-size:10px;margin:2px 0;">(Credit)</p>
          <p style="font-size:10px;font-style:italic;margin:0;">${copyType}</p>
          <div style="margin-top:6px;font-size:10px;line-height:1.5;text-align:right;">
            <p>GSTIN : ${companyGstin}</p>
            <p>PAN : ${companyPan}</p>
          </div>
        </div>
      </div>

      <!-- Recipient + Invoice Details -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;">
        <tr>
          <td style="width:50%;border-right:1px solid #000;padding:5px;vertical-align:top;font-size:10px;line-height:1.6;">
            <div style="font-size:9px;font-weight:bold;color:#444;">Details of Recipient (Billed to)</div>
            <div style="font-weight:bold;margin-top:2px;">${record.supplier.supplierName}</div>
            <div>${record.supplier.supplierAddress || ""}</div>
            <div>${record.supplier.city ? record.supplier.city + ", " : ""}${record.supplier.state || ""}</div>
            <div>State Code : 23</div>
            <div>GSTIN : ${record.supplier.gstNumber || ""}</div>
            <div>Mobile No : ${record.supplier.mobileNumber || ""}</div>
          </td>
          <td style="width:50%;padding:5px;vertical-align:top;font-size:10px;">
            <table style="width:100%;border-collapse:collapse;line-height:1.7;">
              <tr><td>Invoice No</td><td style="font-weight:bold;">: ${record.purchaseCode}</td></tr>
              <tr><td>Date of Inv</td><td>: ${format(record.purchaseDate, "dd-MM-yyyy")}</td></tr>
              <tr><td>Place of Supply</td><td>: ${placeOfSupply}</td></tr>
              <tr><td>Date of Supply</td><td>: ${format(record.purchaseDate, "dd-MM-yyyy")}</td></tr>
              <tr><td>Vehicle No.</td><td>: ${vehicleNo}</td></tr>
              <tr><td>Transporter Name</td><td>: ${transporterName}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2" style="padding:5px;font-size:10px;line-height:1.6;border-top:1px solid #000;">
            <div style="font-size:9px;font-weight:bold;color:#444;">Details of Consignee (Shipped to)</div>
            <div style="font-weight:bold;margin-top:2px;">${record.supplier.supplierName}</div>
            <div>${record.supplier.supplierAddress || ""}</div>
            <div>${record.supplier.city ? record.supplier.city + ", " : ""}${record.supplier.state || ""}</div>
            <div>State Code : 23</div>
            <div>GSTIN : ${record.supplier.gstNumber || ""}</div>
            <div>Mobile No : ${record.supplier.mobileNumber || ""}</div>
          </td>
        </tr>
      </table>

      <!-- Items Table -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;">
        <thead>
          <tr style="background:#f0f0f0;">
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:4%;">Sr. No.</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;text-align:left;width:30%;">Description of Goods</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:8%;">HSN/SAC</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:6%;">Qty</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:6%;">UOM</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:10%;">Rate (per Item)</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:12%;">Taxable Value</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:6%;">IGST %</th>
            <th style="border:1px solid #000;padding:4px 5px;font-size:10px;width:12%;">IGST Amount</th>
          </tr>
        </thead>
        <tbody>
          ${
            items.length > 0
              ? items.map((item, idx) => {
                  const description = [
                    item.brand?.brandName,
                    item.category?.categoryName,
                    item.type?.typeName,
                    item.quality?.qualityName,
                  ]
                    .filter(Boolean)
                    .join(" / ");

                  return `
    <tr>
      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:center;">${idx + 1}</td>
      
      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;">
        ${description || "-"}
      </td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:center;">-</td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">
        ${Number(item.purchaseQty)}
      </td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:center;">
        PCS
      </td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">
        ${Number(item.purchaseRate).toFixed(2)}
      </td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">
        ${Number(item.purchaseAmount).toFixed(2)}
      </td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">
        18
      </td>

      <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">
        ${(Number(item.purchaseAmount) * 0.18).toFixed(2)}
      </td>
    </tr>
  `;
                })
              : `<tr><td colspan="9" style="border:1px solid #000;padding:10px;text-align:center;font-size:10px;">No items</td></tr>`
          }
          <tr style="font-weight:bold;background:#f9f9f9;">
            <td colspan="2" style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">TOTAL</td>
            <td style="border:1px solid #000;padding:3px 5px;"></td>
            <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">${totalQty}</td>
            <td style="border:1px solid #000;padding:3px 5px;"></td>
            <td style="border:1px solid #000;padding:3px 5px;"></td>
            <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">${record.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td style="border:1px solid #000;padding:3px 5px;"></td>
            <td style="border:1px solid #000;padding:3px 5px;font-size:10px;text-align:right;">${record.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary -->
      <table style="width:100%;border-collapse:collapse;border:1px solid #000;border-top:none;">
        <tr>
          <td style="width:60%;border-right:1px solid #000;padding:3px 6px;font-size:10px;"></td>
          <td style="width:25%;padding:3px 6px;font-size:10px;">Total Taxable Value</td>
          <td style="width:15%;padding:3px 6px;font-size:10px;text-align:right;font-weight:bold;">${record.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="border-right:1px solid #000;border-top:1px solid #000;padding:3px 6px;font-size:10px;"></td>
          <td style="border-top:1px solid #000;padding:3px 6px;font-size:10px;">IGST 18% Sale</td>
          <td style="border-top:1px solid #000;padding:3px 6px;font-size:10px;text-align:right;font-weight:bold;">${record.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
        <tr>
          <td style="border-right:1px solid #000;border-top:1px solid #000;padding:3px 6px;font-size:10px;"></td>
          <td style="border-top:1px solid #000;padding:3px 6px;font-size:10px;">Total Invoice Value (In Figure)</td>
          <td style="border-top:1px solid #000;padding:3px 6px;font-size:10px;text-align:right;font-weight:bold;">${record.nettAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
        </tr>
      </table>

      <!-- Amount in Words -->
      <div style="border:1px solid #000;border-top:none;padding:4px 6px;font-size:10px;">
        <span style="font-weight:bold;">Total Invoice Value (In Words) </span>Rupees ${numberToWords(record.nettAmount)}
      </div>

      <!-- Bank + Signature -->
      <div style="display:flex;border:1px solid #000;border-top:none;">
        <div style="flex:1;padding:5px 6px;border-right:1px solid #000;font-size:10px;">
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <th style="text-align:left;font-size:10px;padding-bottom:3px;">Bank Name</th>
              <th style="text-align:left;font-size:10px;padding-bottom:3px;">Account No</th>
              <th style="text-align:left;font-size:10px;padding-bottom:3px;">IFSC Code</th>
            </tr>
            <tr>
              <td style="font-size:10px;">${bankName}</td>
              <td style="font-size:10px;">${accountNo}</td>
              <td style="font-size:10px;">${ifscCode}</td>
            </tr>
          </table>
        </div>
        <div style="width:180px;padding:5px 8px;font-size:10px;text-align:right;">
          <p>Certified that the Particulars given above are true and correct</p>
          <p style="font-weight:bold;margin-top:4px;">For ${companyName}</p>
          <div style="height:45px;"></div>
          <p style="font-size:9px;">(Authorised Signatory)</p>
        </div>
      </div>

      <!-- Terms -->
      <div style="border:1px solid #000;border-top:none;padding:5px 7px;font-size:9px;">
        <strong>TERM &amp; CONDITION</strong>
        <ol style="padding-left:14px;margin-top:3px;line-height:1.5;">
          <li>All disputes are subjected to local Jurisdiction only.</li>
          <li>Our responsibility ceases goods are removed from factory &amp; no claim of shortage or loss etc on any account will be entertained.</li>
          <li>I/We here by certified that the goods mentioned in this invoice are warranted to be of the nature and quality which it is proposes to be.</li>
          <li>Certified that the particulars given above are true and the amount indicated represents the price actually charged and there is no additional consideration flowing directly or indirectly from the buyer.</li>
        </ol>
      </div>
    </div>
  `;

  const printWindow = window.open("", "_blank", "width=900,height=700");
  if (!printWindow) return;
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Tax Invoice - ${record.purchaseCode}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { background: #fff; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${invoiceHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 400);
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PurchaseForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"form" | "search">("form");

  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string>("");

  console.log("re-render from parent");

  const handleBackToForm = () => {
    setViewMode("form");
    setSearchQuery("");
    setDateFilter(undefined);
    setSupplierFilter("");
  };

  useEffect(() => {
    handleGetSuppliers();
  }, []);

  const handleGetSuppliers = async () => {
    try {
      const pulledSuppliers = await getSuppliers();
      if (!pulledSuppliers) throw new Error("Supplier undefined");
      if (pulledSuppliers.success && pulledSuppliers.data) {
        return setSuppliers(pulledSuppliers.data);
      } else {
        return setSuppliers([]);
      }
    } catch (err: any) {
      return toast({
        title: "Error",
        description: "Failed pulling suppliers",
        variant: "destructive",
      });
    }
  };

  const filteredRecords =
    Array.isArray(purchaseRecords) && purchaseRecords.length > 0
      ? purchaseRecords.filter((record) => {
          const matchesSearch =
            searchQuery === "" ||
            record.purchaseCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            record.supplier.supplierName
              .toLowerCase()
              .includes(searchQuery.toLowerCase());

          const matchesDate =
            !dateFilter ||
            format(record.purchaseDate, "yyyy-MM-dd") ===
              format(dateFilter, "yyyy-MM-dd");

          const matchesSupplier =
            supplierFilter === "" ||
            record.supplier.id.toString() === supplierFilter.toString();

          return matchesSearch && matchesDate && matchesSupplier;
        })
      : [];

  // ─── Search View ───────────────────────────────────────────────────────────
  const SearchView = () => (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBackToForm}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Form
                </Button>
                <CardTitle className="text-2xl font-semibold text-gray-800">
                  Purchase Records
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by code or supplier..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFilter && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter
                        ? format(dateFilter, "dd-MM-yyyy")
                        : "Pick a date"}
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

              {/* Supplier Filter */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  Filter by Supplier
                </Label>
                <ComboboxSupplier
                  data={suppliers}
                  setSelected={setSupplierFilter}
                  selectedId={Number(supplierFilter)}
                />
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || dateFilter || supplierFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDateFilter(undefined);
                  setSupplierFilter("");
                }}
                className="mt-4 text-sm"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">
                      Purchase Code
                    </TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">
                      Supplier Name
                    </TableHead>
                    <TableHead className="font-semibold">Mobile</TableHead>
                    <TableHead className="font-semibold text-right">
                      Sub Total
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Total Tax
                    </TableHead>
                    <TableHead className="font-semibold text-right">
                      Nett Amount
                    </TableHead>
                    <TableHead className="font-semibold text-center">
                      Items
                    </TableHead>
                    <TableHead className="font-semibold">Created By</TableHead>
                    <TableHead className="font-semibold text-center">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                          <span>Loading...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        className="text-center py-8 text-gray-500"
                      >
                        No purchase records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {record.purchaseCode}
                        </TableCell>
                        <TableCell>
                          {format(record.purchaseDate, "dd-MM-yyyy")}
                        </TableCell>
                        <TableCell>
                          {record.supplier?.supplierName || "-"}
                        </TableCell>
                        <TableCell>
                          {record.supplier?.mobileNumber || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{record.subTotal.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          ₹{record.totalTax.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{record.nettAmount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {record.itemCount}
                          </span>
                        </TableCell>
                        <TableCell>{record.createdBy}</TableCell>

                        {/* ── Action buttons ── */}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            {/* View button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {/* Print button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                              title="Print Invoice"
                              onClick={() => printInvoice(record)}
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

            {/* Results Summary */}
            {!loading && filteredRecords.length > 0 && (
              <div className="mt-4 text-sm text-gray-600">
                Showing {filteredRecords.length} of {purchaseRecords.length}{" "}
                records
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return viewMode === "form" ? (
    <FormView
      setViewMode={setViewMode}
      setPurchaseRecords={setPurchaseRecords}
      suppliers={suppliers as any}
    />
  ) : (
    <SearchView />
  );
}
