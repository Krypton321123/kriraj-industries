// ─── ReceivingForm.tsx ───────────────────────────────────────────────────────
// Place at: src/components/receiving/ReceivingForm.tsx

"use client";

import { useState, useEffect } from "react";
import ReceivingFormView from "./ReceivingFormView";
import ReceivingSearchView from "./ReceivingSearchView";
import { getReceivingRecords, getIncomes } from "@/actions/receiving/actions";

export default function ReceivingForm() {
  const [viewMode, setViewMode] = useState<"form" | "search">("form");
  const [receivingRecords, setReceivingRecords] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState<{ status: boolean; data: any }>({
    status: false,
    data: {},
  });

  // Load incomes once on mount so they're ready for both views
  useEffect(() => {
    getIncomes().then(setIncomes).catch(console.error);
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const records = await getReceivingRecords();
      setReceivingRecords(records.data || []);
      setViewMode("search");
    } catch (err) {
      console.error("Failed to load records", err);
    } finally {
      setLoading(false);
    }
  };

  if (viewMode === "search") {
    return (
      <ReceivingSearchView
        receivingRecords={receivingRecords}
        incomes={incomes}
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
    <ReceivingFormView
      setViewMode={setViewMode}
      setReceivingRecords={loadRecords}
      isEditing={isEditing}
    />
  );
}


// ─── page.tsx ────────────────────────────────────────────────────────────────
// Place at: src/app/receiving/page.tsx

