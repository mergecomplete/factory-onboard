// What the API and the page agree on. One file, so the page can't drift from
// the routes it calls.

export type Item = {
  id: string;
  title: string;
  createdAt: string;
};

export type NewItem = {
  title: string;
  // Optional. The seed passes fixed ids so running it twice adds nothing.
  id?: string;
};

export const TITLE_MAX = 200;

// The Reports page: a fixed list, filtered by type.
export const REPORT_TYPES = ["sales", "usage", "billing"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export type Report = {
  id: string;
  title: string;
  type: ReportType;
  createdAt: string;
};
