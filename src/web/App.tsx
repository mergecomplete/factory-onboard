import { type FormEvent, useEffect, useState } from "react";

import { type Item, TITLE_MAX } from "../shared";
import { addItem, getVersion, listItems } from "./api";
import { Reports } from "./Reports";

/**
 * Two pages, picked by the path (wrangler serves index.html for both): the
 * items at /, the reports at /reports.
 */
export function App() {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    getVersion().then(setVersion, () => setVersion("unknown"));
  }, []);
  const onReports = window.location.pathname.replace(/\/+$/, "") === "/reports";

  return (
    <main>
      <nav>
        <a href="/" aria-current={onReports ? undefined : "page"}>
          Items
        </a>
        <a href="/reports" aria-current={onReports ? "page" : undefined}>
          Reports
        </a>
      </nav>
      {onReports ? <Reports /> : <Items />}
      <footer>Version {version ?? "…"}</footer>
    </main>
  );
}

/** The items, and a form that adds one. */
function Items() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listItems()
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const item = await addItem({ title });
      setItems((current) => [...(current ?? []), item]);
      setTitle("");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h1>Reports</h1>
      {items === null ? (
        <p>Loading…</p>
      ) : items.length === 0 ? (
        <p>No items yet. Add the first one below.</p>
      ) : (
        <ul aria-label="Items">
          {items.map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      )}
      <form onSubmit={onSubmit}>
        <label htmlFor="title">New item</label>
        <input
          id="title"
          value={title}
          maxLength={TITLE_MAX}
          onChange={(event) => setTitle(event.target.value)}
          required
        />
        <button type="submit" disabled={saving}>
          Add
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
