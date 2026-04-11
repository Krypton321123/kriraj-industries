"use client";

import { useState, useEffect } from "react";
import PaymentFormView from "./PaymentFormView";
import PaymentSearchView from "./PaymentSearchView";
import { getPaymentRecords, getExpenses } from "@/actions/payments/actions";

export default function PaymentForm() {
  const [viewMode, setViewMode] = useState<"form" | "search">("form");
  const [paymentRecords, setPaymentRecords] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<{ status: boolean; data: any }>({
    status: false,
    data: {},
  });

  // Load expenses once on mount so they're available for both form and search view
  useEffect(() => {
    getExpenses().then(setExpenses).catch(console.error);
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const records = await getPaymentRecords();
      setPaymentRecords(records.data || []);
      setViewMode("search");
    } catch (err) {
      console.error("Failed to load records", err);
    } finally {
      setLoading(false);
    }
  };

  if (viewMode === "search") {
    return (
      <PaymentSearchView
        paymentRecords={paymentRecords}
        expenses={expenses}
        loading={loading}
        onBackToForm={() => {
          setViewMode("form");
          setIsEditing({ status: false, data: {} });
        }}
        setEditing={setIsEditing}
      />
    );
  }

  return (
    <PaymentFormView
      setViewMode={setViewMode}
      setPaymentRecords={loadRecords}
      isEditing={isEditing}
    />
  );
}