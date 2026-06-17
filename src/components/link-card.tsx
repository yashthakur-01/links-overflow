"use client";

import React, { useState } from "react";
import {
  ExternalLink,
  Play,
  Trash2,
  FolderGit2,
  Briefcase,
  Copy,
  Check,
  Edit2,
  MessageCircle,
  Camera,
  MessageSquare,
  MoreVertical,
  FolderInput,
  FolderMinus,
} from "lucide-react";
import { useAppState } from "@/app/providers";
import type {
  LinkItem,
  YouTubeMeta,
  GitHubMeta,
  LinkedInMeta,
  CodingPlatformMeta,
  DesignMeta,
  DocumentMeta,
  BlogMeta,
  SocialMediaMeta,
  OtherMeta,
} from "@/lib/types";

interface LinkCardProps {
  item: LinkItem;
  index: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<LinkItem>) => void;
  customSections: string[];
}

const CATEGORY_BADGES: Record<string, { bg: string; text: string; border: string }> = {
  YouTube:            { bg: "bg-red-500/15",     text: "text-red-400",     border: "border-red-500/30" },
  LinkedIn:           { bg: "bg-blue-500/15",    text: "text-blue-400",    border: "border-blue-500/30" },
  GitHub:             { bg: "bg-gray-500/15",    text: "text-gray-300",    border: "border-gray-500/30" },
  "Coding Platforms": { bg: "bg-amber-500/15",   text: "text-amber-400",   border: "border-amber-500/30" },
  Design:             { bg: "bg-purple-500/15",  text: "text-purple-400",  border: "border-purple-500/30" },
  Documents:          { bg: "bg-sky-500/15",     text: "text-sky-400",     border: "border-sky-500/30" },
  "Blogs, Articles & Others": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  "Instagram":        { bg: "bg-pink-500/15",    text: "text-pink-400",    border: "border-pink-500/30" },
  "Discord":          { bg: "bg-indigo-500/15",  text: "text-indigo-400",  border: "border-indigo-500/30" },
  "WhatsApp":         { bg: "bg-green-500/15",   text: "text-green-400",   border: "border-green-500/30" },
  "Twitter/X":        { bg: "bg-gray-500/15",    text: "text-gray-300",    border: "border-gray-500/30" },
  "No Context Links": { bg: "bg-cyan-500/15",    text: "text-cyan-400",    border: "border-cyan-500/30" },
};

const CATEGORY_HOVERS: Record<string, string> = {
  YouTube:            "hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]",
  LinkedIn:           "hover:border-blue-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.6)]",
  GitHub:             "hover:border-gray-100 hover:shadow-[0_0_20px_rgba(255,255,255,0.6)]",
  "Coding Platforms": "hover:border-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.6)]",
  Design:             "hover:border-purple-400 hover:shadow-[0_0_20px_rgba(192,132,252,0.6)]",
  Documents:          "hover:border-sky-400 hover:shadow-[0_0_20px_rgba(56,189,248,0.6)]",
  "Blogs, Articles & Others": "hover:border-emerald-400 hover:shadow-[0_0_20px_rgba(52,211,153,0.6)]",
  "Instagram":        "hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.6)]",
  "Discord":          "hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.6)]",
  "WhatsApp":         "hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]",
  "Twitter/X":        "hover:border-gray-400 hover:shadow-[0_0_20px_rgba(156,163,175,0.6)]",
  "No Context Links": "hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]",
};

const CODING_PLATFORM_COLORS: Record<string, { bg: string; text: string }> = {
  LeetCode:   { bg: "bg-amber-500/20",  text: "text-amber-300" },
  Codeforces: { bg: "bg-blue-500/20",   text: "text-blue-300" },
  CodeChef:   { bg: "bg-yellow-800/30", text: "text-yellow-200" },
};

export default function LinkCard({ item, index, onRemove, onUpdate, customSections }: LinkCardProps) {
  const [playing, setPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const badge = CATEGORY_BADGES[item.category] || CATEGORY_BADGES["No Context Links"];
  const hoverClass = CATEGORY_HOVERS[item.category] || CATEGORY_HOVERS["No Context Links"];

  const { showToast } = useAppState();

  // Universal inline editing state
  const [isEditing, setIsEditing] = useState(false);
  
  // Menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMoveOptions, setShowMoveOptions] = useState(false);
  
  // Extract a default title for the edit field
  const getDefaultTitle = () => {
    if (item.customTitle) return item.customTitle;
    const m = item.meta as any;
    return m.title || m.entityName || m.identifier || m.fileName || m.repoName || "Link";
  };
  
  const getDefaultContext = () => {
    if (item.customDescription) return item.customDescription;
    const m = item.meta as any;
    return m.context || m.description || "";
  };

  const [editTitle, setEditTitle] = useState(getDefaultTitle());
  const [editContext, setEditContext] = useState(getDefaultContext());

  const handleCopy = () => {
    navigator.clipboard.writeText(item.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdate(item.id, {
      customTitle: editTitle.trim(),
      customDescription: editContext.trim(),
    });
    setIsEditing(false);
  };

  const handleMoveClick = () => {
    if (customSections.length === 0) {
      showToast("No user made sections available. Create one in the sidebar first.", "error");
      setIsMenuOpen(false);
    } else {
      setShowMoveOptions(!showMoveOptions);
    }
  };

  const handleMoveToSection = (section: string) => {
    onUpdate(item.id, { 
      category: section,
      originalCategory: item.originalCategory || item.category 
    });
    setIsMenuOpen(false);
    setShowMoveOptions(false);
    showToast(`Moved to ${section}`, "success");
  };

  const handleRemoveFromSection = () => {
    if (item.originalCategory) {
      onUpdate(item.id, {
        category: item.originalCategory,
        originalCategory: undefined
      });
      setIsMenuOpen(false);
      showToast("Removed from section", "success");
    }
  };

  if (isEditing) {
    return (
      <div
        className={`animate-fade-in-up group relative bg-[#12121a]/70 backdrop-blur-2xl border border-[#2a2a3a] rounded-2xl p-4 transition-all duration-300 ${hoverClass}`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1 block">Custom Title</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Enter title"
              className="w-full bg-[#1a1a26] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-pink-500/60"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1 block">Custom Description</label>
            <textarea
              value={editContext}
              onChange={(e) => setEditContext(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="w-full bg-[#1a1a26] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-pink-500/60 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#1e1e2e]">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-[#2a2a3a] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="px-4 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md hover:opacity-90 transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    // If user has set a custom title/description, we render a generic card using those values
    if (item.customTitle || item.customDescription) {
      return (
        <div className="group/edit">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm text-white line-clamp-2">
              {item.customTitle}
            </h3>
          </div>
          {item.customDescription && (
            <p className="text-xs text-gray-100 mt-1.5 line-clamp-3 leading-relaxed">
              {item.customDescription}
            </p>
          )}
        </div>
      );
    }
    switch (item.category) {
      case "YouTube": {
        const meta = item.meta as YouTubeMeta;
        return (
          <div>
            <div className="relative rounded-xl overflow-hidden aspect-video bg-black mb-3">
              {playing ? (
                <iframe
                  src={`https://www.youtube.com/embed/${meta.videoId}?autoplay=1`}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://img.youtube.com/vi/${meta.videoId}/hqdefault.jpg`}
                    alt={meta.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlaying(true);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/35 hover:bg-black/15 transition-colors cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/90 flex items-center justify-center shadow-lg shadow-red-500/30">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </button>
                </>
              )}
            </div>
            <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
              {meta.title}
            </h3>
            <p className="text-xs text-gray-200 mt-1">{meta.channel}</p>
          </div>
        );
      }

      case "GitHub": {
        const meta = item.meta as GitHubMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FolderGit2 size={20} className="text-gray-100 shrink-0" />
              <h3 className="font-semibold text-sm text-white truncate">
                {meta.repoName
                  ? `${meta.username}/${meta.repoName}`
                  : meta.username}
              </h3>
            </div>
            <p className="text-xs text-gray-100 line-clamp-3 leading-relaxed">
              {meta.description}
            </p>
          </div>
        );
      }

      case "LinkedIn": {
        const meta = item.meta as LinkedInMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase size={20} className="text-blue-400 shrink-0" />
              <h3 className="font-semibold text-sm text-white truncate">
                {meta.identifier}
              </h3>
            </div>
            <p className="text-xs text-gray-100">{meta.contentType}</p>
          </div>
        );
      }

      case "Coding Platforms": {
        const meta = item.meta as CodingPlatformMeta;
        const platColor = CODING_PLATFORM_COLORS[meta.platform] || { bg: "bg-gray-500/20", text: "text-gray-100" };
        return (
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${platColor.bg} ${platColor.text}`}
            >
              <span className="w-2 h-2 rounded-full bg-current animate-pulse-dot" />
              {meta.platform}
            </span>
            <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
              {meta.entityName}
            </h3>
            <p className="text-xs text-gray-200 mt-1">{meta.type}</p>
          </div>
        );
      }

      case "Design": {
        const meta = item.meta as DesignMeta;
        return (
          <div>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
                meta.platform === "Figma"
                  ? "bg-purple-500/20 text-purple-300"
                  : "bg-teal-500/20 text-teal-300"
              }`}
            >
              {meta.platform}
            </span>
            <h3 className="font-semibold text-sm text-white line-clamp-2">
              {meta.fileName}
            </h3>
          </div>
        );
      }

      case "Documents": {
        const meta = item.meta as DocumentMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-sky-500/20 text-sky-300 tracking-wider">
                {meta.fileExtension}
              </span>
            </div>
            <h3 className="font-semibold text-sm text-white line-clamp-2">
              {meta.title}
            </h3>
          </div>
        );
      }

      case "Blogs, Articles & Others": {
        const meta = item.meta as BlogMeta;
        return (
          <div>
            <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
              {meta.title}
            </h3>
            {meta.description && (
              <p className="text-xs text-gray-100 mt-1.5 line-clamp-3 leading-relaxed">
                {meta.description}
              </p>
            )}
          </div>
        );
      }

      case "Instagram": {
        const meta = item.meta as SocialMediaMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Camera size={20} className="text-pink-400 shrink-0" />
              <h3 className="font-semibold text-sm text-white truncate">
                {meta.identifier}
              </h3>
            </div>
            <p className="text-xs text-gray-100">{meta.contentType}</p>
          </div>
        );
      }

      case "Discord": {
        const meta = item.meta as SocialMediaMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={20} className="text-indigo-400 shrink-0" />
              <h3 className="font-semibold text-sm text-white truncate">
                {meta.identifier}
              </h3>
            </div>
            <p className="text-xs text-gray-100">{meta.contentType}</p>
          </div>
        );
      }

      case "WhatsApp": {
        const meta = item.meta as SocialMediaMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageCircle size={20} className="text-green-400 shrink-0" />
              <h3 className="font-semibold text-sm text-white truncate">
                {meta.identifier}
              </h3>
            </div>
            <p className="text-xs text-gray-100">{meta.contentType}</p>
          </div>
        );
      }

      case "Twitter/X": {
        const meta = item.meta as SocialMediaMeta;
        return (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={20} className="text-gray-300 shrink-0" />
              <h3 className="font-semibold text-sm text-white truncate">
                {meta.identifier}
              </h3>
            </div>
            <p className="text-xs text-gray-100">{meta.contentType}</p>
          </div>
        );
      }

      default: {
        const meta = item.meta as OtherMeta;
        return (
          <div className="group/edit">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-sm text-white line-clamp-2">
                {meta.title}
              </h3>
            </div>
            {meta.context && (
              <p className="text-xs text-gray-100 mt-1.5 line-clamp-2">
                {meta.context}
              </p>
            )}
          </div>
        );
      }
    }
  };

  return (
    <div
      className={`animate-fade-in-up group relative bg-[#12121a]/70 backdrop-blur-2xl border border-[#2a2a3a] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 ${hoverClass} ${isMenuOpen ? "z-50" : ""}`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {item.favicon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.favicon}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          )}
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}
          >
            {item.subcategory}
          </span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg hover:bg-[#2a2a3a] text-gray-500 hover:text-gray-200 transition-colors cursor-pointer"
            title="Copy URL"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
          </button>
          
          {/* Three Dot Menu */}
          <div 
            className="relative"
            onMouseLeave={() => {
              if (isMenuOpen) {
                setIsMenuOpen(false);
                setShowMoveOptions(false);
              }
            }}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1.5 rounded-lg hover:bg-[#2a2a3a] text-gray-500 hover:text-gray-200 transition-colors cursor-pointer"
            >
              <MoreVertical size={14} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full pt-1 w-48 z-50">
                <div className="bg-[#1a1a26] border border-[#2a2a3a] rounded-xl shadow-xl overflow-hidden text-sm animate-fade-in-up">
                {!showMoveOptions ? (
                  <div className="flex flex-col py-1">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsEditing(true);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a3a] transition-colors cursor-pointer"
                    >
                      <Edit2 size={14} /> Update Metadata
                    </button>
                    <button
                      onClick={handleMoveClick}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a3a] transition-colors cursor-pointer"
                    >
                      <FolderInput size={14} /> Move Link
                    </button>
                    {item.originalCategory && (
                      <button
                        onClick={handleRemoveFromSection}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a3a] transition-colors cursor-pointer"
                      >
                        <FolderMinus size={14} /> Remove from Section
                      </button>
                    )}
                    <div className="h-px bg-[#2a2a3a] my-1" />
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        onRemove(item.id);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col py-1">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-[#2a2a3a]">
                      Move to section
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {customSections.map(section => (
                        <button
                          key={section}
                          onClick={() => handleMoveToSection(section)}
                          className="flex items-center w-full px-3 py-2 text-left text-gray-300 hover:bg-[#2a2a3a] transition-colors cursor-pointer truncate"
                        >
                          {section}
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-[#2a2a3a] my-1" />
                    <button
                      onClick={() => setShowMoveOptions(false)}
                      className="w-full px-3 py-1.5 text-center text-xs text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {renderContent()}

      {/* URL + timestamp footer */}
      <div className="mt-3 pt-3 border-t border-[#1e1e2e] flex items-center justify-between">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-gray-600 hover:text-violet-400 truncate max-w-[70%] transition-colors"
        >
          {item.url.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
        <span className="text-[10px] text-gray-700">
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
