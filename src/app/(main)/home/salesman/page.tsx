'use client'

import Main from "@/components/Masters/salesman/main";
import { getAllSalesmen } from "@/actions/masters/salesman/actions";
import { useEffect, useState } from "react";

export default function SalesmanPage({ tabId }: { tabId: string }) {
  const [salesmen, setSalesmen] = useState<any[]>([]);

  useEffect(() => {
    const fetchSalesmen = async () => {
      const data = await getAllSalesmen();
      setSalesmen(data || []);
    };

    fetchSalesmen();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Salesman Management</h1>
      <Main initialSalesmen={salesmen} />
    </div>
  );
}