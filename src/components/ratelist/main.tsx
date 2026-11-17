"use client";

import React, { useEffect, useState } from "react";
import SelectForm from "./select-form";
import RateTable from "./rate-table";
import { getAllTaxes } from "@/actions/tax/actions";

const Main = ({
  customers,
  itemData,
}: {
  customers: any;
  itemData: { brands: any; category: any; types: any; quality: any };
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<any>({});
  console.log("selected customer:", selectedCustomer);
  const [date, setDate] = useState("");
  const [taxes, setTaxes] = useState<any[]>([]);
  console.log(itemData);

  useEffect(() => {
    const fetchTaxes = async () => {
      const res = await getAllTaxes();
      setTaxes(res);
    };

    fetchTaxes();
  }, []);

  useEffect(() => {
    console.log(date, selectedCustomer);
  }, [date, selectedCustomer]);

  return (
    <div className="w-full h-full mr-10 flex flex-col mt-4 items-center">
      <div className="w-[95%] mx-10">
        <SelectForm
          customers={customers}
          customer={selectedCustomer}
          date={date}
          setDate={setDate}
          setCustomer={setSelectedCustomer}
        />
      </div>
      <div className="w-[95%] mt-5 flex justify-center items-center">
        <RateTable
          itemData={itemData}
          taxes={taxes}
          customerId={selectedCustomer.id}
        />
      </div>
    </div>
  );
};

export default Main;
