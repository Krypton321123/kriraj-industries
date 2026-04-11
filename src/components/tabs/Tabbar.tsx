"use client";

import { useTabs } from "@/store/useTabs";
import { X } from "lucide-react";

export default function TabBar() {
  const { tabs, activeTab, setActiveTab, closeTab } = useTabs();

  return (
    <div className="flex items-end gap-0.5 bg-gray-100 px-3 pt-2 border-b border-gray-200 overflow-x-auto scrollbar-none">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group relative flex items-center gap-2 px-4 py-2 rounded-t-lg
              text-sm font-medium cursor-pointer select-none
              border border-b-0 transition-all duration-150 min-w-0 max-w-[180px]
              ${isActive
                ? "bg-white border-gray-200 text-gray-800 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)]"
                : "bg-transparent border-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60"
              }
            `}
          >
            {/* Active tab bottom cover — hides the border-b of the container */}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-white" />
            )}

            {/* Dirty indicator dot on inactive tabs */}
            {tab.isDirty && !isActive && (
              <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}

            {/* Tab title */}
            <span className="truncate leading-none">{tab.title}</span>

            {/* Dirty dot on active tab */}
            {tab.isDirty && isActive && (
              <span className="shrink-0 text-amber-500 text-xs leading-none">●</span>
            )}

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className={`
                shrink-0 rounded p-0.5 transition-all duration-100
                ${isActive
                  ? "text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                  : "text-transparent group-hover:text-gray-400 group-hover:hover:text-gray-600 group-hover:hover:bg-gray-200"
                }
              `}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
}