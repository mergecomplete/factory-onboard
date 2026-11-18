import { REPORT_TYPES, type Report, type ReportType } from "../shared";

// The reports the Reports page lists. Fixed, so the page and its filter have
// something real to show without a database.
export const REPORTS: readonly Report[] = [
  { id: "r-1", title: "Sales by month", type: "sales", createdAt: "2026-09-01T09:00:00.000Z" },
  { id: "r-2", title: "Active users", type: "usage", createdAt: "2026-09-08T09:00:00.000Z" },
  { id: "r-3", title: "Unpaid invoices", type: "billing", createdAt: "2026-09-15T09:00:00.000Z" },
  { id: "r-4", title: "Sales by region", type: "sales", createdAt: "2026-10-01T09:00:00.000Z" },
  { id: "r-5", title: "Sign-ups by week", type: "usage", createdAt: "2026-10-06T09:00:00.000Z" },
];

export function isReportType(value: string): value is ReportType {
  return (REPORT_TYPES as readonly string[]).includes(value);
}

/** The reports of one type, or all of them with no type; newest first. */
export function filterReports(type?: ReportType): Report[] {
  return REPORTS.filter((r) => type === undefined || r.type === type).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}
