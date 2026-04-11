'use client'

import Sidebar from "@/components/Sidebar";
import TabBar from "@/components/tabs/Tabbar";
import TabRenderer from "@/components/tabs/TabRenderer";
import { EditContext } from "@/contexts/editContext";
import { useState } from "react";


export default function layout() {

  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>("");
  const [editingFor, setEditingFor] = useState<string | null>(null);

  return (
    <EditContext.Provider value={{ editing, setEditing, editingId, setEditingId, editingFor, setEditingFor }}>
      
      <div className="w-full h-screen flex bg-[#F7F2FF]">
        
        {/* ✅ SIDEBAR */}
        <Sidebar />

        {/* ✅ MAIN TAB SYSTEM */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {/* 🔥 TAB BAR */}
          <TabBar />

          {/* 🔥 TAB CONTENT */}
          <div className="flex-1 overflow-auto p-6">
            <div className="w-full">
              <TabRenderer />
            </div>
          </div>

        </div>

      </div>

    </EditContext.Provider>
  );
}