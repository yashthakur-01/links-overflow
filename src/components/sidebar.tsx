"use client";

import React from "react";
import {
  Search,
  Video,
  Briefcase,
  FolderGit2,
  Code2,
  Palette,
  FileText,
  BookOpen,
  Layers,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { useAppState } from "@/app/providers";
import type { CategoryName, LinkItem } from "@/lib/types";

interface SidebarProps {
  links: LinkItem[];
  onClearAll: () => void;
}

const CATEGORY_CONFIG: {
  name: CategoryName;
  icon: React.ReactNode;
  color: string;
  subcategories: string[];
}[] = [
  {
    name: "YouTube",
    icon: <Video size={18} />,
    color: "text-red-400",
    subcategories: ["Video", "Shorts", "Playlist"],
  },
  {
    name: "LinkedIn",
    icon: <Briefcase size={18} />,
    color: "text-blue-400",
    subcategories: ["User Profile", "Company Page", "Feed Post", "Job Listing"],
  },
  {
    name: "GitHub",
    icon: <FolderGit2 size={18} />,
    color: "text-gray-300",
    subcategories: ["Repository", "User Profile", "Organization", "Gist"],
  },
  {
    name: "Coding Platforms",
    icon: <Code2 size={18} />,
    color: "text-amber-400",
    subcategories: ["Question", "User Profile", "Contest", "Course/Playlist"],
  },
  {
    name: "Design",
    icon: <Palette size={18} />,
    color: "text-purple-400",
    subcategories: ["Design Workspace", "Prototype", "Presentation", "Template"],
  },
  {
    name: "Documents",
    icon: <FileText size={18} />,
    color: "text-blue-300",
    subcategories: ["Google Drive File", "Static PDF"],
  },
  {
    name: "Blogs & Articles",
    icon: <BookOpen size={18} />,
    color: "text-emerald-400",
    subcategories: ["Reading List"],
  },
  {
    name: "Others",
    icon: <Layers size={18} />,
    color: "text-gray-400",
    subcategories: ["Unclassified"],
  },
];

export default function Sidebar({ links, onClearAll }: SidebarProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    searchQuery,
    setSearchQuery,
  } = useAppState();

  const categoryCounts: Record<string, number> = {};
  links.forEach((l) => {
    categoryCounts[l.category] = (categoryCounts[l.category] || 0) + 1;
  });
  const totalLinks = links.length;

  const activeConfig =
    selectedCategory !== "All"
      ? CATEGORY_CONFIG.find((c) => c.name === selectedCategory)
      : null;

  return (
    <aside className="flex flex-col h-full w-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
          Smart Link Organizer
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Organize anything, instantly.
        </p>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            id="search-input"
            type="text"
            placeholder="Search links…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[#12121a] border border-[#2a2a3a] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 transition-all"
          />
        </div>
      </div>

      {/* Category list */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* All */}
        <button
          id="filter-all"
          onClick={() => setSelectedCategory("All")}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
            selectedCategory === "All"
              ? "bg-violet-500/12 text-violet-400 font-semibold"
              : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
          }`}
        >
          <LayoutGrid size={18} />
          <span className="flex-1 text-left">All Links</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a26] text-gray-500 min-w-[28px] text-center">
            {totalLinks}
          </span>
        </button>

        <div className="h-px bg-[#1e1e2e] my-2" />

        {CATEGORY_CONFIG.map((cat) => {
          const count = categoryCounts[cat.name] || 0;
          const isActive = selectedCategory === cat.name;

          return (
            <div key={cat.name}>
              <button
                id={`filter-${cat.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-violet-500/12 text-violet-400 font-semibold"
                    : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
                }`}
              >
                <span className={isActive ? "text-violet-400" : cat.color}>
                  {cat.icon}
                </span>
                <span className="flex-1 text-left">{cat.name}</span>
                {count > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a26] text-gray-500 min-w-[28px] text-center">
                    {count}
                  </span>
                )}
              </button>

              {/* Subcategory pills */}
              {isActive && activeConfig && (
                <div className="flex flex-wrap gap-1.5 px-3 pt-2 pb-1 animate-fade-in-up">
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      selectedSubcategory === null
                        ? "bg-violet-500 text-white shadow-[0_0_12px_rgba(124,92,252,0.25)]"
                        : "bg-[#1a1a26] text-gray-400 hover:bg-[#222232] hover:text-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {activeConfig.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        selectedSubcategory === sub
                          ? "bg-violet-500 text-white shadow-[0_0_12px_rgba(124,92,252,0.25)]"
                          : "bg-[#1a1a26] text-gray-400 hover:bg-[#222232] hover:text-gray-200"
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Clear all */}
      {totalLinks > 0 && (
        <div className="px-4 py-4 border-t border-[#1e1e2e]">
          <button
            id="clear-all-btn"
            onClick={onClearAll}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all cursor-pointer"
          >
            <Trash2 size={15} />
            Clear All Links
          </button>
        </div>
      )}
    </aside>
  );
}
