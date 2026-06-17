// Map a server publish-gate issue (field + issue from collectPublishIssues) to a
// human message and the editor tab that hosts the field, so the publish panel's
// issue list is clickable straight to where the fix lives (FR-PROJ-029 / spec §5,§10).

export type EditorTab =
  | "basics"
  | "overview"
  | "scopes"
  | "highlights"
  | "gallery"
  | "case-study"
  | "related"
  | "seo";

export interface GateIssue {
  field: string;
  issue: string;
}

export interface MappedIssue {
  message: string;
  tab: EditorTab;
}

export function mapGateIssue({ field, issue }: GateIssue): MappedIssue {
  if (field.startsWith("gallery[")) {
    const n = field.match(/\[(\d+)\]/)?.[1];
    return { message: `Gallery image ${n !== undefined ? Number(n) + 1 : ""} needs alt text.`.replace("  ", " "), tab: "gallery" };
  }
  switch (field) {
    case "title":
      return { message: "Title is required.", tab: "basics" };
    case "summary":
      return { message: "Summary is required to publish.", tab: "basics" };
    case "category":
      return { message: "Choose a category.", tab: "basics" };
    case "location":
      return { message: "Choose a location.", tab: "basics" };
    case "client_type":
      return { message: "Select a client type.", tab: "basics" };
    case "start_date":
      return { message: "Set a start date.", tab: "basics" };
    case "end_date":
      return { message: "Completed projects need an end date.", tab: "basics" };
    case "cover_image":
      return { message: "Add a cover image.", tab: "basics" };
    case "cover_image.alt":
      return { message: "Cover image needs alt text.", tab: "basics" };
    default:
      return { message: `${field}: ${issue}`, tab: "basics" };
  }
}
