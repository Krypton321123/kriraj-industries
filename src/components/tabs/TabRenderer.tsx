// components/TabRenderer.tsx
"use client";

import { useTabs } from "@/store/useTabs";
import { pageRegistry } from "@/lib/pageRegistry";

export default function TabRenderer() {
  const { tabs, activeTab } = useTabs();

  const getComponent = (path: string) => {
    if (pageRegistry[path]) return pageRegistry[path];

    // dynamic match
    if (path.startsWith("/home/")) {
      return pageRegistry["/home/[master]"];
    }

    return null;
  };

  return (
    <>
      {tabs.map((tab) => {
        const Component = getComponent(tab.path);

        return (
          <div
            key={tab.id}
            className={activeTab === tab.id ? "block" : "hidden"}
          >
            <Component tabId={tab.id} params={{ master: tab.path.split("/")[2] }} />
          </div>
        );
      })}
    </>
  );
}
