"use client";

import React, { createContext, useContext, useState, type ReactNode } from "react";
import type { CategoryName } from "@/lib/types";

interface AppState {
  selectedCategory: CategoryName | "All";
  setSelectedCategory: (c: CategoryName | "All") => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (s: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toast: { message: string; type: "success" | "error" } | null;
  showToast: (message: string, type: "success" | "error") => void;
}

const AppContext = createContext<AppState | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryName | "All">("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <AppContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory: (c) => {
          setSelectedCategory(c);
          setSelectedSubcategory(null);
        },
        selectedSubcategory,
        setSelectedSubcategory,
        searchQuery,
        setSearchQuery,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppState must be used within Providers");
  return ctx;
}
