// @ts-nocheck
// Shared UI helpers + icon set (inline SVGs - simple, not representational)

export const Arrow = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <line x1="4" y1="12" x2="20" y2="12"/>
    <polyline points="14,6 20,12 14,18"/>
  </svg>
);

export const ArrowUpRight = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <line x1="6" y1="18" x2="18" y2="6"/>
    <polyline points="9,6 18,6 18,15"/>
  </svg>
);

export const ChevronLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <polyline points="15,6 9,12 15,18"/>
  </svg>
);
export const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
    <polyline points="9,6 15,12 9,18"/>
  </svg>
);

// Abstract geometric service icons (no buildings drawn literally)
export const SvcIcon = ({ kind }) => {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "square" };
  const shapes = {
    building:   <g><rect x="4" y="7" width="7" height="14"/><rect x="13" y="3" width="7" height="18"/><line x1="6" y1="11" x2="9" y2="11"/><line x1="6" y1="15" x2="9" y2="15"/><line x1="15" y1="7" x2="18" y2="7"/><line x1="15" y1="12" x2="18" y2="12"/><line x1="15" y1="17" x2="18" y2="17"/></g>,
    road:       <g><path d="M6 3 L4 21"/><path d="M18 3 L20 21"/><line x1="12" y1="5" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="15"/><line x1="12" y1="19" x2="12" y2="21"/></g>,
    bridge:     <g><path d="M3 14 Q12 4 21 14"/><line x1="3" y1="19" x2="21" y2="19"/><line x1="8" y1="14" x2="8" y2="19"/><line x1="16" y1="14" x2="16" y2="19"/></g>,
    earth:      <g><path d="M3 18 L8 12 L13 16 L21 6"/><line x1="3" y1="21" x2="21" y2="21"/></g>,
    drain:      <g><path d="M3 8 Q8 12 12 8 T21 8"/><path d="M3 16 Q8 20 12 16 T21 16"/></g>,
    concrete:   <g><rect x="4" y="4" width="16" height="16"/><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="14" x2="20" y2="14"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="14" y1="4" x2="14" y2="20"/></g>,
    foundation: <g><line x1="3" y1="8" x2="21" y2="8"/><line x1="3" y1="14" x2="21" y2="14"/><line x1="6" y1="8" x2="6" y2="14"/><line x1="12" y1="8" x2="12" y2="14"/><line x1="18" y1="8" x2="18" y2="14"/><path d="M3 20 L6 14"/><path d="M21 20 L18 14"/></g>,
    renov:      <g><path d="M4 20 L4 10 L12 4 L20 10 L20 20 Z"/><path d="M14 20 L14 14 L18 14 L18 20"/><path d="M7 14 L11 14 L11 18 L7 18 Z"/></g>,
    finish:     <g><rect x="3" y="3" width="18" height="18"/><path d="M3 3 L21 21"/><path d="M21 3 L3 21"/></g>,
    special:    <g><polygon points="12,3 20,8 20,16 12,21 4,16 4,8"/><polygon points="12,8 16,10.5 16,15.5 12,18 8,15.5 8,10.5"/></g>,
    equip:      <g><circle cx="8" cy="17" r="2.5"/><circle cx="17" cy="17" r="2.5"/><path d="M3 14 L3 10 L10 10 L14 6 L19 6 L21 10 L21 14"/></g>,
  };
  return <svg {...common}>{shapes[kind] || shapes.building}</svg>;
};

export const Social = ({ k }) => {
  const common = { width: 14, height: 14, viewBox: "0 0 24 24", fill: "currentColor" };
  const p = {
    fb:  "M13 22v-8h3l.5-4H13V7.5c0-1.2.3-2 2-2h2V2.1C16.5 2 15.5 2 14.5 2 11.8 2 10 3.7 10 6.7V10H7v4h3v8h3z",
    ig:  "M12 2a5 5 0 0 0 0 10 5 5 0 0 0 0-10zm0 8.3a3.3 3.3 0 1 1 0-6.6 3.3 3.3 0 0 1 0 6.6zM16.8 1.2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4zM17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5zm3 15a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v10z",
    li:  "M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.3 18H5.7V9.7h2.6V18zM7 8.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM18.3 18h-2.6v-4.2c0-1 0-2.3-1.4-2.3s-1.6 1.1-1.6 2.2V18h-2.6V9.7h2.5v1.1h0a2.7 2.7 0 0 1 2.5-1.4c2.6 0 3.1 1.7 3.1 4V18z",
    yt:  "M22 8.4s-.2-1.5-.8-2.1c-.8-.9-1.7-.9-2.1-.9-3-.2-7.5-.2-7.5-.2s-4.5 0-7.5.2c-.4 0-1.3 0-2.1.9C1.4 6.9 1.2 8.4 1.2 8.4S1 10.2 1 12v1.6c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.9 1.9.9 2.4 1 1.7.2 7.4.2 7.4.2s4.5 0 7.5-.2c.4-.1 1.3-.1 2.1-1 .6-.6.8-2.1.8-2.1s.2-1.8.2-3.6V12c0-1.8-.2-3.6-.2-3.6zM9.5 15.5V9l6 3.2-6 3.3z",
  };
  return <svg {...common}><path d={p[k]}/></svg>;
};


