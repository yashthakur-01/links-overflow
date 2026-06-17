"use client";

import React, { useState, useMemo, useCallback } from "react";
import Fuse from "fuse.js";
import {
  Link2,
  Loader2,
  Sparkles,
  AlertCircle,
  X,
  Menu,
  ChevronRight,
} from "lucide-react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAppState } from "@/app/providers";
import Sidebar from "@/components/sidebar";
import LinkCard from "@/components/link-card";
import HeroFooter from "@/components/hero-footer";
import type { LinkItem, FetchLinkResponse } from "@/lib/types";

export default function DashboardPage() {
  const { links, customSections, isReady, addLink, removeLink, updateLink, clearLinks, addCustomSection, removeCustomSection } = useAuthSession();
  const {
    selectedCategory,
    selectedSubcategory,
    searchQuery,
    toast,
    showToast,
    isSidebarCollapsed,
  } = useAppState();

  const [urlInput, setUrlInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Submit URL ─────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = urlInput.trim();
      if (!trimmed) return;

      let checkUrl = trimmed;
      if (!/^https?:\/\//i.test(checkUrl)) {
        checkUrl = "https://" + checkUrl;
      }
      if (links.some((l) => l.url.toLowerCase() === checkUrl.toLowerCase())) {
        showToast("This link is already in your list.", "error");
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch("/api/fetch-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: trimmed }),
        });
        const json: FetchLinkResponse = await res.json();

        if (json.success && json.data) {
          const newItem: LinkItem = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            ...json.data,
          };
          addLink(newItem);
          setUrlInput("");
          showToast("Link categorized successfully!", "success");
        } else {
          showToast(json.error || "Failed to process link.", "error");
        }
      } catch {
        showToast("Network error. Please try again.", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [urlInput, addLink, showToast]
  );

  // ── Filtering ──────────────────────────────────────────────
  const filteredLinks = useMemo(() => {
    let result = links;

    if (selectedCategory !== "All") {
      result = result.filter((l) => l.category === selectedCategory);
    }

    if (selectedSubcategory) {
      result = result.filter((l) => l.subcategory === selectedSubcategory);
    }

    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: [
          "url",
          "category",
          "subcategory",
          "meta.title",
          "meta.description",
          "meta.channel",
          "meta.username",
          "meta.repoName",
          "meta.entityName",
          "meta.platform",
          "meta.fileName",
          "meta.identifier",
          "meta.context",
        ],
        threshold: 0.35,
        ignoreLocation: true,
      });
      result = fuse.search(searchQuery).map((r) => r.item);
    }

    return result;
  }, [links, selectedCategory, selectedSubcategory, searchQuery]);

  // ── Loading state ──────────────────────────────────────────
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Mobile sidebar overlay ──────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-[#0d0d14] border-r border-[#1e1e2e] transform transition-all duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${isSidebarCollapsed ? "w-20" : "w-72"}`}
      >
        <Sidebar 
          links={links} 
          onClearAll={clearLinks} 
          customSections={customSections} 
          onAddCustomSection={addCustomSection}
          onRemoveCustomSection={removeCustomSection} 
          onMobileItemSelect={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0 px-4 sm:px-6 lg:px-10 py-6 min-h-screen">
        {/* Mobile header */}
        <div className="flex items-center gap-3 mb-6 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-[#12121a] border border-[#2a2a3a] text-gray-400 hover:text-gray-100 transition-colors cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent">
            Links Overflow
          </h1>
        </div>

        {/* ── URL Input Form ────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-md pt-2 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10 border-b border-white/5 mb-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={18} className="text-pink-500" />
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                Add a Link
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <div className="relative flex-1">
                <Link2
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />
                <input
                  id="url-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Paste any URL — YouTube, GitHub, LeetCode, Figma…"
                  disabled={isLoading}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#12121a] border border-[#2a2a3a] rounded-2xl text-sm text-gray-200 placeholder:text-gray-600 outline-none focus:border-pink-500/60 focus:ring-2 focus:ring-pink-500/20 transition-all disabled:opacity-50"
                />
              </div>
              <button
                id="organize-btn"
                type="submit"
                disabled={isLoading || !urlInput.trim()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-sm font-semibold hover:opacity-90 hover:shadow-[0_0_24px_rgba(236,72,153,0.4)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <ChevronRight size={18} />
                )}
                <span className="hidden sm:inline">
                  {isLoading ? "Processing…" : "Organize"}
                </span>
              </button>
            </form>
          </div>
        </div>

        {/* ── Active filter breadcrumb ──────────────────────── */}
        {(selectedCategory !== "All" || searchQuery) && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <span className="text-xs text-gray-600">Showing:</span>
            {selectedCategory !== "All" && (
               <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-400 border border-violet-500/30">
                {selectedCategory}
                {selectedSubcategory && ` → ${selectedSubcategory}`}
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                &quot;{searchQuery}&quot;
              </span>
            )}
            <span className="text-xs text-gray-600">
              — {filteredLinks.length} result{filteredLinks.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* ── Link Grid ─────────────────────────────────────── */}
        {filteredLinks.length > 0 ? (
          <div className={`grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${isSidebarCollapsed ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
            {filteredLinks.map((item, i) => (
              <LinkCard
                key={item.id}
                item={item}
                index={i}
                onRemove={removeLink}
                onUpdate={updateLink}
                customSections={customSections}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#12121a] border border-[#2a2a3a] flex items-center justify-center mb-4">
              <Link2 size={28} className="text-gray-700" />
            </div>
            <h3 className="text-base font-semibold text-gray-400 mb-1">
              {links.length === 0 ? "No links yet" : "No matching links"}
            </h3>
            <p className="text-sm text-gray-600 max-w-sm">
              {links.length === 0
                ? "Paste a URL above to get started. We'll automatically categorize it for you."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        )}

        <div className="mt-auto pt-12">
          {/* ── Footer ────────────────────────────────────────── */}
          <HeroFooter />
        </div>
      </main>

      {/* ── Toast Notifications ─────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border animate-slide-in ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90 border-red-500/30 text-red-300"
          }`}
        >
          {toast.type === "success" ? (
            <Sparkles size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button className="ml-1 text-gray-500 hover:text-gray-200 transition-colors cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
