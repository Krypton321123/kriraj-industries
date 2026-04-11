"use client";

import { useEffect, useState } from "react";
import FormView from "./FormView";
import SalesSearchView from "./SalesSearchView";
import { getCustomers, getSalesTypes, getSalesRecords } from "@/actions/sales/actions";

type Customer = {
  id: number;
  customerCode: string;
  customerName: string;
  customerAddress: string;
  city: string;
  state: string;
  mobileNumber: string;
  gstNumber: string;
  openingBalance: string;
};

type SalesType = {
  id: number;
  code: string;
  name: string;
};

export default function SalesForm() {
  const [viewMode, setViewMode] = useState<"form" | "search">("form");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salesTypes, setSalesTypes] = useState<SalesType[]>([]);
  const [salesRecords, setSalesRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingState, setEditingState] = useState<{data: any, status: boolean}>({data: {}, status: false})

  useEffect(() => {
    loadCustomers();
    loadSalesTypes();
  }, []);

  // Re-fetch records every time user switches to search view
  useEffect(() => {
    if (viewMode === "search") {
      loadSalesRecords();
    }
  }, [viewMode]);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
    }
  };

  const loadSalesTypes = async () => {
    try {
      const result = await getSalesTypes();
      console.log("result", result)
      if (result.success) setSalesTypes(result.data);
    } catch (err) {
      console.error("Failed to load sales types", err);
    }
  };

  const loadSalesRecords = async () => {
    try {
      setLoading(true);
      const result = await getSalesRecords();
      if (result.success) setSalesRecords(result.data);
    } catch (err) {
      console.error("Failed to load sales records", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setViewMode("form");
  };

  return (
    <>
      {viewMode === "form" && (
        <FormView
          setViewMode={setViewMode}
          setSalesRecords={setSalesRecords}
          customers={customers}
          isEditing={editingState}
        />
      )}

      {viewMode === "search" && (
        <SalesSearchView
          salesRecords={salesRecords}
          customers={customers}
          salesTypes={salesTypes}
          loading={loading}
          onBackToForm={handleBackToForm}
          setEditing={setEditingState}
        />
      )}
    </>
  );
}
