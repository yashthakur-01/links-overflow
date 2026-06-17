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
  MessageCircle,
  HelpCircle,
  Camera,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Plus,
  FolderOpen,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useAppState } from "@/app/providers";
import type { CategoryName, LinkItem } from "@/lib/types";

interface SidebarProps {
  links: LinkItem[];
  onClearAll: () => void;
  customSections: string[];
  onAddCustomSection: (section: string) => void;
  onRemoveCustomSection: (section: string) => void;
}

const CATEGORY_CONFIG: {
  name: CategoryName;
  icon: React.ReactNode;
  color: string;
  subcategories: string[];
}[] = [
  {
    name: "YouTube",
    icon: <img src="/youtubeLogo.jpg" alt="YouTube" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-red-400",
    subcategories: ["Video", "Shorts", "Playlist"],
  },
  {
    name: "LinkedIn",
    icon: <img src="/linkedinlogo.jpg" alt="LinkedIn" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-blue-400",
    subcategories: ["User Profile", "Company Page", "Feed Post", "Job Listing"],
  },
  {
    name: "GitHub",
    icon: <img src="/githubLogo.png" alt="GitHub" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-gray-300",
    subcategories: ["Repository", "User Profile", "Organization", "Gist"],
  },
  {
    name: "Coding Platforms",
    icon: <img src="/leetcodelogo.png" alt="Coding" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-amber-400",
    subcategories: ["Question", "User Profile", "Contest", "Course/Playlist"],
  },
  {
    name: "Design",
    icon: <img src="/designLogo.png" alt="Design" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-purple-400",
    subcategories: ["Design Workspace", "Prototype", "Presentation", "Template"],
  },
  {
    name: "Documents",
    icon: <img src="/documentlogo.jpeg" alt="Documents" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-blue-300",
    subcategories: ["Google Drive File", "Static PDF"],
  },
  {
    name: "Blogs, Articles & Others",
    icon: <img src="/blogsArticlesLogo.jpeg" alt="Blogs" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-emerald-400",
    subcategories: ["Reading List", "Other Document"],
  },
  {
    name: "Instagram",
    icon: <img src="/instagramLogo.jpeg" alt="Instagram" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-pink-400",
    subcategories: ["Post", "Reel", "Profile", "Other"],
  },
  {
    name: "Discord",
    icon: <img src="/discordLogo.webp" alt="Discord" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-indigo-400",
    subcategories: ["Invite Link", "Server", "Other"],
  },
  {
    name: "WhatsApp",
    icon: <img src="/whatsapplogo.jpeg" alt="WhatsApp" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-green-400",
    subcategories: ["Chat Link", "Group", "Other"],
  },
  {
    name: "Twitter/X",
    icon: <img src="/twitterXLogo.jpeg" alt="Twitter/X" className="w-[18px] h-[18px] object-cover rounded-sm opacity-90" />,
    color: "text-gray-300",
    subcategories: ["Post", "Profile"],
  },
  {
    name: "No Context Links",
    icon: <HelpCircle size={18} />,
    color: "text-cyan-400",
    subcategories: ["Unclassified"],
  },
];

export default function Sidebar({ links, onClearAll, customSections, onAddCustomSection, onRemoveCustomSection }: SidebarProps) {
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
  const [showClearAllPopup, setShowClearAllPopup] = useState(false);
  const {
    selectedCategory,
    setSelectedCategory,
    selectedSubcategory,
    setSelectedSubcategory,
    searchQuery,
    setSearchQuery,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
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

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSectionName.trim()) {
      onAddCustomSection(newSectionName.trim());
      setNewSectionName("");
      setIsCreatingSection(false);
    }
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete) {
      onRemoveCustomSection(sectionToDelete);
      if (selectedCategory === sectionToDelete) {
        setSelectedCategory("All");
      }
      setSectionToDelete(null);
    }
  };

  const confirmClearAll = () => {
    onClearAll();
    setShowClearAllPopup(false);
  };

  return (
    <>
      {/* Confirmation Modals */}
      {(sectionToDelete || showClearAllPopup) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#12121a] border border-[#2a2a3a] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">
              {sectionToDelete ? "Delete Section?" : "Clear All Links?"}
            </h3>
            <p className="text-sm text-gray-400 mb-6">
              {sectionToDelete 
                ? `Are you sure you want to delete "${sectionToDelete}"? All links inside will be moved back to their original AI categories.`
                : "Are you sure you want to delete all your saved links? This action cannot be undone."}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setSectionToDelete(null);
                  setShowClearAllPopup(false);
                }}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a3a] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={sectionToDelete ? confirmDeleteSection : confirmClearAll}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors cursor-pointer"
              >
                {sectionToDelete ? "Delete Section" : "Clear All"}
              </button>
            </div>
          </div>
        </div>
      )}

    <aside className="relative flex flex-col h-full w-full bg-[#0d0d14] group/sidebar">
      {/* Toggle button */}
      <button
        onClick={() => setIsSidebarCollapsed((prev) => !prev)}
        className="absolute right-3 top-7 z-[60] p-1 rounded-full bg-[#1a1a26] border border-[#2a2a3a] text-gray-400 hover:text-white transition-all shadow-lg opacity-0 group-hover/sidebar:opacity-100 cursor-pointer"
      >
        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand */}
      <div className={`px-5 pt-6 pb-4 flex items-center ${isSidebarCollapsed ? "justify-center" : ""}`}>
        {isSidebarCollapsed ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/logoWithoutName.jpeg" alt="Logo" className="w-12 h-12 object-contain" />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src="/logoWithName.png" alt="Links Overflow" className="h-14 w-full object-contain object-left" />
        )}
      </div>

      {/* Search */}
      {!isSidebarCollapsed && (
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
              className="w-full pl-9 pr-4 py-2.5 bg-[#12121a] border border-[#2a2a3a] rounded-xl text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all"
            />
          </div>
        </div>
      )}

      {/* Category list */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-1 mt-2">
        {/* All */}
        <div className="relative group/tooltip">
          <button
            id="filter-all"
            onClick={() => setSelectedCategory("All")}
            className={`flex items-center w-full py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
            } ${
              selectedCategory === "All"
                ? "bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-white font-semibold shadow-[inset_2px_0_0_rgba(236,72,153,1)]"
                : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
            }`}
          >
            <LayoutGrid size={18} className={selectedCategory === "All" ? "text-pink-400" : ""} />
            {!isSidebarCollapsed && (
              <>
                <span className="flex-1 text-left">All Links</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a26] text-gray-500 min-w-[28px] text-center">
                  {totalLinks}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Custom Sections */}
        {!isSidebarCollapsed && (
          <div className="pt-3 pb-1 flex items-center justify-between px-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Sections</span>
            <button
              onClick={() => setIsCreatingSection(!isCreatingSection)}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-[#1a1a26] transition-colors cursor-pointer"
              title="Create new section"
            >
              <Plus size={14} />
            </button>
          </div>
        )}

        {isCreatingSection && !isSidebarCollapsed && (
          <div className="px-3 mb-2">
            <form onSubmit={handleCreateSection} className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="Section name..."
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#12121a] border border-pink-500/50 rounded-lg text-sm text-gray-200 outline-none focus:ring-1 focus:ring-pink-500 transition-all"
              />
            </form>
          </div>
        )}

        {customSections.map((section) => {
          const count = categoryCounts[section] || 0;
          const isActive = selectedCategory === section;

          return (
            <div key={section} className="relative group/tooltip">
              <button
                onClick={() => setSelectedCategory(section)}
                className={`flex items-center w-full py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3 pr-8"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-white font-semibold shadow-[inset_2px_0_0_rgba(236,72,153,1)]"
                    : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
                }`}
              >
                <FolderOpen size={18} className={isActive ? "text-pink-400" : "text-gray-400"} />
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{section}</span>
                    {count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a26] text-gray-500 min-w-[28px] text-center">
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>
              {!isSidebarCollapsed && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSectionToDelete(section);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 opacity-0 group-hover/tooltip:opacity-100 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all cursor-pointer"
                  title="Delete section"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}

        <div className="h-px bg-[#1e1e2e] my-3" />
        
        {!isSidebarCollapsed && (
          <div className="pt-1 pb-1 px-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categories</span>
          </div>
        )}

        {CATEGORY_CONFIG.map((cat) => {
          const count = categoryCounts[cat.name] || 0;
          const isActive = selectedCategory === cat.name;

          return (
            <div key={cat.name} className="relative group/tooltip">
              <button
                id={`filter-${cat.name.toLowerCase().replace(/[^a-z]/g, "-")}`}
                onClick={() => setSelectedCategory(cat.name)}
                className={`flex items-center w-full py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  isSidebarCollapsed ? "justify-center px-0" : "gap-3 px-3"
                } ${
                  isActive
                    ? "bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-white font-semibold shadow-[inset_2px_0_0_rgba(236,72,153,1)]"
                    : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
                }`}
              >
                <span className={isActive ? "text-pink-400" : cat.color}>
                  {cat.icon}
                </span>
                {!isSidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{cat.name}</span>
                    {count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a26] text-gray-500 min-w-[28px] text-center">
                        {count}
                      </span>
                    )}
                  </>
                )}
              </button>

              {/* Subcategory dropdown list */}
              {isActive && activeConfig && !isSidebarCollapsed && (
                <div className="flex flex-col gap-1 px-3 pt-2 pb-1 animate-fade-in-up">
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className={`text-left px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                      selectedSubcategory === null
                        ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-semibold shadow-sm border-l-2 border-pink-500"
                        : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {activeConfig.subcategories.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`text-left px-4 py-2 rounded-lg text-sm transition-all cursor-pointer ${
                        selectedSubcategory === sub
                          ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white font-semibold shadow-sm border-l-2 border-pink-500"
                          : "text-gray-400 hover:bg-[#1a1a26] hover:text-gray-200"
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
            onClick={() => setShowClearAllPopup(true)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
            {!isSidebarCollapsed && <span>Clear All Links</span>}
          </button>
        </div>
      )}
    </aside>
    </>
  );
}
