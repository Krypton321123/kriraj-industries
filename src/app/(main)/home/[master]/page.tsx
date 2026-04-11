'use client'

import { useEffect, useState } from "react";
import { fetchMasterData, MasterType } from "@/actions/masters/actions";
import Grid from "@/components/Masters/Grid";

export default function Page({
  params,
  tabId,
}: {
  params: { master: string };
  tabId: string;
}) {
  const [data, setData] = useState<any[]>([]);

  const master = params.master;
  console.log(master)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchMasterData(master as MasterType);
      setData(res.success ? res.data : []);
    };

    fetchData();
  }, [master]);

  return (
    <div className="w-full h-full flex flex-col mx-4 my-5">
      <div className="w-full h-32 bg-gray-200 rounded-tr-2xl rounded-tl-2xl p-4">
        <p className="text-4xl capitalize">{master} Master</p>
        <p className="text-gray-600">
          Inspect or change the {master} master
        </p>
      </div>

      <Grid
        noOfCols={4}
        name={master}
        masterType={master as MasterType}
        data={data}
      />
    </div>
  );
}