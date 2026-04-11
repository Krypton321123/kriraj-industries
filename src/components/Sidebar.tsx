"use client";
import { motion, AnimatePresence } from "motion/react";
import {
  LuTableOfContents,
  LuCalendarCheck2,
  LuMessageCircleHeart,
  LuChevronDown,
  LuChevronRight,
} from "react-icons/lu";
import { IoSparkles, IoDiamondOutline } from "react-icons/io5";
import { IoMdRocket } from "react-icons/io";
import { FaBoxes, FaBook } from "react-icons/fa";
import { CiGlobe, CiCalendar, CiMail, CiBank } from "react-icons/ci";
import { HiOutlineUsers } from "react-icons/hi2";
import { TbBulb, TbDatabase, TbSettings } from "react-icons/tb";
import { BsBackpack4 } from "react-icons/bs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useTabs } from "@/store/useTabs";

export default function Sidebar() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState<boolean>(false);
  const [expandedSections, setExpandedSections] = useState<any>({});

  const { openTab } = useTabs();

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev: any) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const mainMasters = [
    { name: "Customer", icon: <HiOutlineUsers />, href: "/home/customer" },
    { name: "Salesman", icon: <HiOutlineUsers />, href: "/home/salesman" },
    { name: "Supplier", icon: <HiOutlineUsers />, href: "/home/supplier" },
  ];

  const masters = [
    { name: "Brand", icon: <LuTableOfContents />, href: "/home/brand", type: "master", unique: false },
    { name: "Quality", icon: <IoSparkles />, href: "/home/quality", type: "master", unique: false },
    { name: "Type", icon: <FaBoxes />, href: "/home/type", type: "master", unique: false },
    { name: "Category", icon: <CiGlobe />, href: "/home/category", type: "master", unique: false },
    { name: "Color", icon: <CiCalendar />, href: "/home/color", type: "master", unique: false },
    { name: "Color Type", icon: <CiMail />, href: "/home/colorType", type: "master", unique: false },
    { name: "Color Company", icon: <FaBook />, href: "/home/colorCompany", type: "master", unique: false },
    { name: "Glass Quality", icon: <IoDiamondOutline />, href: "/home/glassQuality", type: "master", unique: false },
    { name: "Glass Type", icon: <TbBulb />, href: "/home/glassType", type: "master", unique: false },
    { name: "Sticker Type", icon: <TbSettings />, href: "/home/stickerType", type: "master", unique: false },
    { name: "Bank", icon: <CiBank />, href: "/home/bank", type: "master", unique: false },
  ];

  const important = [
    { name: "Tax", icon: <TbBulb />, href: "/home/tax" },
    { name: "RateList", icon: <TbBulb />, href: "/home/ratelist" },
    { name: "Purchase", icon: <TbBulb />, href: "/home/purchase" },
    { name: "Sales", icon: <TbBulb />, href: "/home/sales" },
    { name: "Payments", icon: <TbBulb />, href: "/home/payment" },
  ];

  const aboutItems = [
    { name: "Ledgers", icon: <FaBook />, href: "/home/ledger" },
    { name: "Team", icon: <HiOutlineUsers /> },
    { name: "Values", icon: <IoDiamondOutline /> },
    { name: "Vision", icon: <TbBulb /> },
  ];

  const otherItems = [
    { name: "Events", icon: <LuCalendarCheck2 /> },
    { name: "Testimonials", icon: <LuMessageCircleHeart /> },
    { name: "Incubator", icon: <IoMdRocket /> },
    { name: "Careers", icon: <BsBackpack4 /> },
  ];

  const SidebarButton = ({ item, onClick, className = "" }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150 rounded-lg group",
        className
      )}
    >
      <span className="text-base flex-shrink-0 text-gray-400 group-hover:text-orange-500 transition-colors duration-150">
        {item.icon}
      </span>
      {isSidebarExpanded && (
        <span className="text-left truncate font-medium">{item.name}</span>
      )}
    </button>
  );

  const CollapsibleSection = ({ title, items, icon, hasSubItems = false }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="mb-0.5">
        <button
          onClick={() => isSidebarExpanded && setIsExpanded((prev) => !prev)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-all duration-150 rounded-lg group",
            isExpanded
              ? "bg-orange-50 text-orange-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <span className={cn(
            "text-base flex-shrink-0 transition-colors duration-150",
            isExpanded ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"
          )}>
            {icon}
          </span>
          {isSidebarExpanded && (
            <>
              <span className={cn(
                "flex-1 text-left truncate font-medium text-sm",
                isExpanded ? "text-orange-700" : "text-gray-700"
              )}>
                {title}
              </span>
              {hasSubItems && (
                <span className={cn(
                  "flex-shrink-0 transition-colors duration-150",
                  isExpanded ? "text-orange-400" : "text-gray-300"
                )}>
                  {isExpanded ? <LuChevronDown size={14} /> : <LuChevronRight size={14} />}
                </span>
              )}
            </>
          )}
        </button>

        <AnimatePresence>
          {isSidebarExpanded && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="ml-3 mt-0.5 mb-1 space-y-0.5 border-l-2 border-orange-100 pl-3">
                {items.map((item: any, idx: number) => (
                  <SidebarButton
                    key={idx}
                    item={item}
                    onClick={() =>
                      item.href &&
                      openTab({
                        title: item.name,
                        path: item.href,
                        unique: item.unique ?? false,
                      })
                    }
                    className="py-1.5 text-xs text-gray-500"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div
      layout
      initial={{ width: "4rem" }}
      animate={{ width: isSidebarExpanded ? "15rem" : "4rem" }}
      onHoverStart={() => setIsSidebarExpanded(true)}
      onHoverEnd={() => setIsSidebarExpanded(false)}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-screen bg-white flex flex-col overflow-hidden border-r border-gray-100 shadow-[1px_0_20px_rgba(0,0,0,0.04)]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
        <svg
          width="28"
          height="28"
          viewBox="0 0 55 41"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="flex-shrink-0"
        >
          <path
            d="M35.5 0.5C45.9934 0.5 54.5 9.00659 54.5 19.5V40.5C50.0817 40.5 46.5 36.9183 46.5 32.5V19.5C46.5 13.4249 41.5751 8.5 35.5 8.5H30.2988C27.6467 8.50004 25.1029 9.55339 23.2275 11.4287L9.67188 24.9854C8.92179 25.7354 8.50006 26.7527 8.5 27.8135V28.5C8.5 30.7091 10.2909 32.5 12.5 32.5H30.5C30.5 36.7801 27.1389 40.2748 22.9121 40.4893L22.5 40.5H12.5C5.87259 40.5 0.5 35.1274 0.5 28.5V27.8135C0.500062 24.631 1.76427 21.5785 4.01465 19.3281L17.5713 5.77246C20.9469 2.39685 25.525 0.500044 30.2988 0.5H35.5Z"
            fill="#FF500B"
          />
          <path
            d="M37.5 12.5C40.2614 12.5 42.5 14.7386 42.5 17.5V40.5C38.0817 40.5 34.5 36.9183 34.5 32.5V20.5H31.1562L24.6207 27.0355C23.683 27.9732 22.4113 28.5 21.0852 28.5H12.9775C12.5588 28.5 12.3491 27.9937 12.6452 27.6976L26.3789 13.9648C27.3165 13.0272 28.588 12.5 29.9141 12.5H37.5Z"
            fill="#FF500B"
          />
        </svg>
        <AnimatePresence>
          {isSidebarExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-semibold text-gray-800 whitespace-nowrap tracking-tight"
            >
              Kriraj
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        <CollapsibleSection title="Main Masters" icon={<TbDatabase />} items={mainMasters} hasSubItems />
        <CollapsibleSection title="Masters" icon={<TbSettings />} items={masters} hasSubItems />
        <CollapsibleSection title="Important" icon={<IoSparkles />} items={important} hasSubItems />

        {/* Divider */}
        <div className="my-2 mx-3 border-t border-gray-100" />

        <CollapsibleSection title="About" icon={<FaBook />} items={aboutItems} hasSubItems />
        <CollapsibleSection title="More" icon={<IoSparkles />} items={otherItems} hasSubItems />
      </div>

      {/* Footer hint — only when collapsed */}
      {!isSidebarExpanded && (
        <div className="pb-4 flex justify-center">
          <div className="w-1 h-1 rounded-full bg-gray-200" />
        </div>
      )}
    </motion.div>
  );
}