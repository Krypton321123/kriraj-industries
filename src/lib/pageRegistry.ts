import Page from "@/app/(main)/home/[master]/page";
import CustomersPage from "@/app/(main)/home/customer/page";
import LedgersPage from "@/app/(main)/home/ledger/page";
import PurchasePage from "@/app/(main)/home/purchase/page";
import RateList from "@/app/(main)/home/ratelist/page";
import SalesPage from "@/app/(main)/home/sales/page";
import SalesmanPage from "@/app/(main)/home/salesman/page";
import SupplierPage from "@/app/(main)/home/supplier/page";
import TaxMasterPage from "@/app/(main)/home/tax/page";
import Payments from "@/app/(main)/home/payment/page";
import ReceivingPage from "@/app/(main)/home/receiving/page";


export const pageRegistry = {
  "/home/customer": CustomersPage,
  "/home/ledger": LedgersPage,
  "/home/purchase": PurchasePage,
  "/home/ratelist": RateList,
  "/home/salesman": SalesmanPage,
  "/home/supplier": SupplierPage,
  "/home/tax": TaxMasterPage, 
  "/home/[master]": Page, 
  "/home/sales": SalesPage, 
  "/home/payment": Payments,
  "/home/receiving": ReceivingPage,
};