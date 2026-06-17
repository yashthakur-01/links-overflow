"use client";

import React from "react";
import { Heart, ExternalLink } from "lucide-react";

export default function HeroFooter() {
  return (
    <footer className="mt-12 border-t border-[#1e1e2e] pt-8 pb-10">
      <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-4">
        {/* Decorative divider */}
        <div className="flex items-center gap-3 text-gray-600 text-xs uppercase tracking-widest font-medium">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-gray-700" />
          Submission Details
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-gray-700" />
        </div>

        {/* Info */}
        <div className="space-y-1">
          <p className="text-sm text-gray-300 font-medium">Yash Thakur</p>
          <a
            href="mailto:yashthakurr001@gmail.com"
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            yashthakurr001@gmail.com
          </a>
        </div>

        {/* CTA Button */}
        <a
          id="digital-heroes-btn"
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_24px_rgba(124,92,252,0.3)] transition-all duration-300 hover:-translate-y-0.5"
        >
          <Heart size={15} fill="currentColor" />
          Built for Digital Heroes
          <ExternalLink size={13} />
        </a>

        <p className="text-[11px] text-gray-700 mt-2">
          Smart Link Organizer — Interview Trial Project
        </p>
      </div>
    </footer>
  );
}
