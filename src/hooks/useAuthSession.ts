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
    setIsReady(true);
  }, []);

  // Persist whenever links change (after init)
  useEffect(() => {
    if (token && isReady) {
      localStorage.setItem(getStorageKey(token), JSON.stringify(links));
    }
  }, [links, token, isReady]);

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

  return { token, links, isReady, addLink, removeLink, updateLink, clearLinks };
}
