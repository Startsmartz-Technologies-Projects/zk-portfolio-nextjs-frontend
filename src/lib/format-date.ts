// Admin date formatting (foundations §9): dates render DD-MM-YYYY, timestamps add HH:mm.
// Deterministic given the input (uses the local Date parts) so it's stable in the admin
// surface; pass an ISO string or a Date.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
