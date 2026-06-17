"use client";

import { useState, useEffect, useCallback } from "react";
import type { LinkItem } from "@/lib/types";

function generateToken(length = 16): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

const TOKEN_KEY = "x-session-token";

function getStorageKey(token: string) {
  return `links_storage_${token}`;
}

export function useAuthSession() {
  const [token, setToken] = useState<string | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Initialize token on mount
  useEffect(() => {
    let stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      stored = generateToken();
      localStorage.setItem(TOKEN_KEY, stored);
    }
    setToken(stored);

    // Load persisted links
    const raw = localStorage.getItem(getStorageKey(stored));
    if (raw) {
      try {
        setLinks(JSON.parse(raw));
      } catch {
        setLinks([]);
      }
    }
    
    // Load persisted sections
    const rawSections = localStorage.getItem(`${getStorageKey(stored)}_sections`);
    if (rawSections) {
      try {
        setCustomSections(JSON.parse(rawSections));
      } catch {
        setCustomSections([]);
      }
    }

    setIsReady(true);
  }, []);

  // Persist whenever links or sections change (after init)
  useEffect(() => {
    if (token && isReady) {
      localStorage.setItem(getStorageKey(token), JSON.stringify(links));
      localStorage.setItem(`${getStorageKey(token)}_sections`, JSON.stringify(customSections));
    }
  }, [links, customSections, token, isReady]);

  const addLink = useCallback((item: LinkItem) => {
    setLinks((prev) => [item, ...prev]);
  }, []);

  const removeLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const updateLink = useCallback((id: string, updates: Partial<LinkItem>) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  }, []);

  const clearLinks = useCallback(() => {
    setLinks([]);
  }, []);

  const addCustomSection = useCallback((section: string) => {
    setCustomSections((prev) => {
      if (prev.includes(section)) return prev;
      return [...prev, section];
    });
  }, []);

  const removeCustomSection = useCallback((section: string) => {
    setCustomSections((prev) => prev.filter((s) => s !== section));
    setLinks((prev) =>
      prev.map((l) => {
        if (l.category === section && l.originalCategory) {
          return { ...l, category: l.originalCategory, originalCategory: undefined };
        }
        return l;
      })
    );
  }, []);

  return {
    token,
    links,
    customSections,
    isReady,
    addLink,
    removeLink,
    updateLink,
    clearLinks,
    addCustomSection,
    removeCustomSection,
  };
}
