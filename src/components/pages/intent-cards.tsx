"use client";
import * as React from "react";
import { SvcIcon } from "../site-ui";

// Client island: the Collaborate "intent_cards" selectable grid (pages-fe-public §A/§E — the
// brief renders the intent-card labels + selection chrome only; the actual form wiring is the
// leads-fe-public-form task, Wave D). Selecting a card highlights it; the chosen intent is exposed
// to the page via the optional onSelect callback for the future form.

export type IntentItem = { id?: string; icon: string | null; title: string | null; body: string | null };

export function IntentCards({ items, onSelect }: { items: IntentItem[]; onSelect?: (id: string) => void }) {
  const [active, setActive] = React.useState<string>("");
  return (
    <div className="intent-grid">
      {items.map((item, i) => {
        const id = item.id ?? String(i);
        return (
          <button
            key={id}
            type="button"
            className={`intent-card ${active === id ? "active" : ""}`}
            onClick={() => {
              setActive(id);
              onSelect?.(id);
            }}
          >
            <div className="intent-icon">
              <SvcIcon kind={item.icon ?? ""} />
            </div>
            <h4>{item.title}</h4>
            {item.body && <p>{item.body}</p>}
          </button>
        );
      })}
    </div>
  );
}
