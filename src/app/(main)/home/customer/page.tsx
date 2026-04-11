'use client'

import Main from "@/components/Masters/Customer/main";
import { getAllCustomers } from "@/actions/masters/customer/actions";
import { useEffect, useState } from "react";

export default function CustomersPage({ tabId }: { tabId: string }) {
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      const data = await getAllCustomers();
      console.log("customers", data);
      setCustomers(data);
    };



    fetchCustomers();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
      <Main initialCustomers={customers} />
    </div>
  );
}