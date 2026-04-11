"use client";
import { useRef } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  description: string;
  hsnSac: string;
  qty: number;
  uom: string;
  rate: number;
  taxableValue: number;
  igstPercent: number;
  igstAmount: number;
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
  // Company/invoice details
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

// Helper: convert number to words (Indian system)
function numberToWords(num: number): string {
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertBelow1000(n: number): string {
    if (n === 0) return "";
    if (n < 20) return ones[n] + " ";
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "") + " ";
    return ones[Math.floor(n / 100)] + " Hundred " + convertBelow1000(n % 100);
  }

  const integer = Math.floor(num);
  if (integer === 0) return "Zero";

  let result = "";
  if (integer >= 10000000) result += convertBelow1000(Math.floor(integer / 10000000)) + "Crore ";
  if (integer % 10000000 >= 100000) result += convertBelow1000(Math.floor((integer % 10000000) / 100000)) + "Lakh ";
  if (integer % 100000 >= 1000) result += convertBelow1000(Math.floor((integer % 100000) / 1000)) + "Thousand ";
  result += convertBelow1000(integer % 1000);
  return result.trim() + " Only";
}

type PrintInvoiceProps = {
  record: PurchaseRecord;
  copyType?: "Original for Recipient" | "Duplicate for Transporter" | "Triplicate for Supplier";
};

const PrintInvoice = ({ record, copyType = "Original for Recipient" }: PrintInvoiceProps) => {
  const printRef = useRef<HTMLDivElement | null>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${record.purchaseCode}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; }
            .invoice-wrapper { width: 210mm; margin: 0 auto; padding: 8mm; }
            .header-title { text-align: center; margin-bottom: 2px; }
            .header-title h1 { font-size: 22px; font-weight: bold; letter-spacing: 1px; }
            .header-title p { font-size: 11px; }
            .tax-invoice-label { position: absolute; right: 8mm; top: 8mm; text-align: right; }
            .tax-invoice-label h2 { font-size: 16px; font-weight: bold; }
            .header-row { display: flex; justify-content: space-between; margin-top: 4px; }
            .company-info { font-size: 10px; }
            .copy-type { font-size: 10px; font-style: italic; }
            table.main { width: 100%; border-collapse: collapse; margin-top: 6px; }
            table.main td, table.main th { border: 1px solid #000; padding: 3px 5px; font-size: 10px; vertical-align: top; }
            .section-label { font-weight: bold; font-size: 9px; color: #444; }
            .bold { font-weight: bold; }
            table.items { width: 100%; border-collapse: collapse; margin-top: 0; }
            table.items th { background: #f0f0f0; border: 1px solid #000; padding: 4px 5px; font-size: 10px; text-align: center; }
            table.items td { border: 1px solid #000; padding: 3px 5px; font-size: 10px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals-row td { font-weight: bold; }
            .summary-table { width: 100%; border-collapse: collapse; }
            .summary-table td { border: 1px solid #000; padding: 3px 6px; font-size: 10px; }
            .words-row { font-size: 10px; padding: 4px 6px; border: 1px solid #000; border-top: none; }
            .bank-section { border: 1px solid #000; border-top: none; display: flex; }
            .bank-info { flex: 1; padding: 4px 6px; font-size: 10px; border-right: 1px solid #000; }
            .sign-section { flex: 1; padding: 4px 6px; font-size: 10px; text-align: right; }
            .terms-sign-row { display: flex; border: 1px solid #000; border-top: none; }
            .terms { flex: 1; padding: 4px 6px; font-size: 9px; border-right: 1px solid #000; }
            .terms ol { padding-left: 14px; }
            .terms li { margin-bottom: 2px; }
            .signature { flex: 1; padding: 4px 6px; font-size: 10px; text-align: right; }
            .signature .company-name { font-weight: bold; font-size: 11px; margin-bottom: 30px; }
            .divider { border-top: 1px solid #000; margin: 6px 0; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .invoice-wrapper { padding: 4mm; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 400);
  };

  // Use sample items if not provided
  const items: PurchaseItem[] = record.items || [];
  const totalQty = items.reduce((sum, i) => sum + i.qty, 0);

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
    <div class="invoice-wrapper" style="position:relative;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border:1px solid #000; padding:6px 8px 4px 8px;">
        <div style="flex:1;">
          <h1 style="font-size:20px;font-weight:bold;letter-spacing:1px;">${companyName}</h1>
          <p style="font-size:10px;color:#555;">(Traders of Auto Parts)</p>
          <div style="margin-top:4px;font-size:10px;">
            <p>Address : ${companyAddress}</p>
            ${companyContact ? `<p>Contact No : ${companyContact}</p>` : ""}
            <p>State Code/Name : ${companyStateCode}</p>
          </div>
        </div>
        <div style="text-align:right;">
          <h2 style="font-size:16px;font-weight:bold;">TAX INVOICE</h2>
          <p style="font-size:10px;">(Credit)</p>
          <p style="font-size:10px;font-style:italic;">${copyType}</p>
          <div style="margin-top:6px;font-size:10px;text-align:right;">
            <p>GSTIN : ${companyGstin}</p>
            <p>PAN : ${companyPan}</p>
          </div>
        </div>
      </div>

      <!-- Recipient + Invoice Details -->
      <table class="main" style="margin-top:0;border-top:none;">
        <tr>
          <td style="width:50%;border-top:none;">
            <div class="section-label">Details of Recipient (Billed to)</div>
            <div class="bold" style="margin-top:2px;">${record.supplier.supplierName}</div>
            <div>${record.supplier.supplierAddress || ""}</div>
            <div>${record.supplier.city ? record.supplier.city + ", " : ""}${record.supplier.state || ""}</div>
            <div>State Code : ${record.supplier.state ? "23" : ""}</div>
            <div>GSTIN : ${record.supplier.gstNumber || ""}</div>
            <div>Mobile No : ${record.supplier.mobileNumber || ""}</div>
          </td>
          <td style="width:50%;border-top:none;vertical-align:top;">
            <table style="width:100%;border-collapse:collapse;font-size:10px;">
              <tr><td>Invoice No</td><td class="bold">: ${record.purchaseCode}</td></tr>
              <tr><td>Date of Inv</td><td>: ${format(record.purchaseDate, "dd-MM-yyyy")}</td></tr>
              <tr><td>Place of Supply</td><td>: ${placeOfSupply}</td></tr>
              <tr><td>Date of Supply</td><td>: ${format(record.purchaseDate, "dd-MM-yyyy")}</td></tr>
              <tr><td>Vehicle No.</td><td>: ${vehicleNo}</td></tr>
              <tr><td>Transporter Name</td><td>: ${transporterName}</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div class="section-label">Details of Consignee (Shipped to)</div>
            <div class="bold" style="margin-top:2px;">${record.supplier.supplierName}</div>
            <div>${record.supplier.supplierAddress || ""}</div>
            <div>${record.supplier.city ? record.supplier.city + ", " : ""}${record.supplier.state || ""}</div>
            <div>State Code : ${record.supplier.state ? "23" : ""}</div>
            <div>GSTIN : ${record.supplier.gstNumber || ""}</div>
            <div>Mobile No : ${record.supplier.mobileNumber || ""}</div>
          </td>
        </tr>
      </table>

      <!-- Items Table -->
      <table class="items" style="border-top:none;">
        <thead>
          <tr>
            <th style="width:4%;">Sr. No.</th>
            <th style="width:30%;text-align:left;">Description of Goods</th>
            <th style="width:8%;">HSN/SAC</th>
            <th style="width:6%;">Qty</th>
            <th style="width:6%;">UOM</th>
            <th style="width:10%;">Rate (per Item)</th>
            <th style="width:12%;">Taxable Value</th>
            <th style="width:6%;">IGST %</th>
            <th style="width:12%;">IGST Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.length > 0 ? items.map((item, idx) => `
            <tr>
              <td class="text-center">${idx + 1}</td>
              <td>${item.description}</td>
              <td class="text-center">${item.hsnSac}</td>
              <td class="text-right">${item.qty}</td>
              <td class="text-center">${item.uom}</td>
              <td class="text-right">${item.rate.toFixed(2)}</td>
              <td class="text-right">${item.taxableValue.toFixed(2)}</td>
              <td class="text-right">${item.igstPercent.toFixed(2)}</td>
              <td class="text-right">${item.igstAmount.toFixed(2)}</td>
            </tr>
          `).join("") : `
            <tr>
              <td colspan="9" style="text-align:center;padding:10px;">No items</td>
            </tr>
          `}
          <!-- Totals Row -->
          <tr style="font-weight:bold;background:#f9f9f9;">
            <td colspan="2" class="text-right">TOTAL</td>
            <td></td>
            <td class="text-right">${totalQty}</td>
            <td></td>
            <td></td>
            <td class="text-right">${record.subTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
            <td></td>
            <td class="text-right">${record.totalTax.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
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
        <span class="bold">Total Invoice Value (In Words) </span>Rupees ${numberToWords(record.nettAmount)}
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
        <div style="width:160px;padding:5px 6px;font-size:10px;text-align:right;">
          <p>Certified that the Particulars given above are true and correct</p>
          <p style="font-weight:bold;margin-top:4px;">For ${companyName}</p>
          <div style="height:40px;"></div>
          <p style="font-size:9px;">(Authorised Signatory)</p>
        </div>
      </div>

      <!-- Terms -->
      <div style="display:flex;border:1px solid #000;border-top:none;">
        <div style="flex:1;padding:4px 6px;font-size:9px;border-right:1px solid #000;">
          <strong>TERM &amp; CONDITION</strong>
          <ol style="padding-left:14px;margin-top:3px;">
            <li>All disputes are subjected to local Jurisdiction only.</li>
            <li>Our responsibility ceases goods are removed from factory &amp; no claim of shortage or loss etc on any account will be entertained.</li>
            <li>I/We here by certified that the goods mentioned in this invoice are warranted to be of the nature and quality which it is proposes to be.</li>
            <li>Certified that the particulars given above are true and the amount indicated represents the price actually charged and there is no additional consideration flowing directly or indirectly from the buyer.</li>
          </ol>
        </div>
      </div>
    </div>
  `;

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>

      {/* Hidden print content */}
      <div
        ref={printRef}
        style={{ display: "none" }}
        dangerouslySetInnerHTML={{ __html: invoiceHTML }}
      />
    </div>
  );
}

export default PrintInvoice;