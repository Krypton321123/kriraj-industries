'use client'

import Main from "@/components/Masters/Supplier/main";
import { getSuppliers } from "@/actions/masters/supplier/actions";
import { useEffect, useState } from "react";

export default function SupplierPage({ tabId }: { tabId: string }) {
  const [suppliers, setSuppliers] = useState<any[]>([]);

  useEffect(() => {
    const fetchSuppliers = async () => {
      const data = await getSuppliers();
      setSuppliers(data || []);
    };

    fetchSuppliers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Supplier Management</h1>
      <Main initialSuppliers={suppliers} />
    </div>
  );
}