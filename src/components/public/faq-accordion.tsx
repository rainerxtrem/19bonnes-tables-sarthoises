"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface FaqItemData {
  id: string;
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItemData[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-ink-900/10 rounded-md border border-ink-900/10 bg-cream-50 shadow-card">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id}>
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg text-ink-900">{item.question}</span>
              <ChevronDown
                className={cn("h-4 w-4 shrink-0 text-gold-600 transition-transform duration-300", isOpen && "rotate-180")}
                aria-hidden
              />
            </button>
            {isOpen ? (
              <div className="px-6 pb-6 text-sm leading-relaxed text-ink-600 whitespace-pre-wrap">{item.answer}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
