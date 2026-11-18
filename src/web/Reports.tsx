import { useEffect, useState } from "react";

import { REPORT_TYPES, type Report, type ReportType } from "../shared";
import { listReports } from "./api";

const LABELS: Record<ReportType, string> = { sales: "Sales", usage: "Usage", billing: "Billing" };

/** The Reports page: every report, newest first, with a filter by type. */
export function Reports() {
  const [type, setType] = useState<ReportType | null>(null);
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setReports(null);
    setError(null);
    listReports(type)
      .then(setReports)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, [type]);

  return (
    <section>
      <h1>Reports</h1>
      <label htmlFor="report-type">Type</label>{" "}
      <select
        id="report-type"
        value={type ?? ""}
        onChange={(event) => setType((event.target.value || null) as ReportType | null)}
      >
        <option value="">All</option>
        {REPORT_TYPES.map((t) => (
          <option key={t} value={t}>
            {LABELS[t]}
          </option>
        ))}
      </select>
      {error ? (
        <p role="alert">{error}</p>
      ) : reports === null ? (
        <p>Loading…</p>
      ) : reports.length === 0 ? (
        <p>No reports of this type.</p>
      ) : (
        <ul aria-label="Reports">
          {reports.map((r) => (
            <li key={r.id}>
              {r.title} <small>{LABELS[r.type]}</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
