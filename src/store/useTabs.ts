// store/useTabs.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tabConfig } from "@/lib/tabConfig";

type Tab = {
  id: string;
  path: string;
  title: string;
  isDirty: boolean;
};

type Store = {
  tabs: Tab[];
  activeTab: string | null;
  openTab: (path: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  markDirty: (id: string, val: boolean) => void;
};

// crypto.randomUUID requires a secure context (HTTPS or localhost).
// Falls back to a manual UUID v4 generator if it's unavailable
// (plain HTTP in production, older browsers, etc).
function generateId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const useTabs = create<Store>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTab: null,
      openTab: (tab: any) => {
        set((state: any) => {
          if (!tab.unique) {
            const exists = state.tabs.find((t: any) => t.path === tab.path);
            if (exists) {
              return { activeTab: exists.id };
            }
          }
          const newTab = {
            id: generateId(),
            title: tab.title,
            path: tab.path,
          };
          return {
            tabs: [...state.tabs, newTab],
            activeTab: newTab.id,
          };
        });
      },
      closeTab: (id) => {
        const { tabs, activeTab } = get();
        const tab = tabs.find((t) => t.id === id);
        if (tab?.isDirty) {
          const ok = confirm("Unsaved changes. Close?");
          if (!ok) return;
        }
        const newTabs = tabs.filter((t) => t.id !== id);
        set({
          tabs: newTabs,
          activeTab:
            activeTab === id
              ? newTabs[newTabs.length - 1]?.id || null
              : activeTab,
        });
      },
      setActiveTab: (id) => set({ activeTab: id }),
      markDirty: (id, val) => {
        set((state) => ({
          tabs: state.tabs.map((t) =>
            t.id === id ? { ...t, isDirty: val } : t,
          ),
        }));
      },
    }),
    {
      name: "erp-tabs",
    },
  ),
);