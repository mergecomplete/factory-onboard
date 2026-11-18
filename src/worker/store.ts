import type { Item, NewItem } from "../shared";

/**
 * The items, in memory. A Worker isolate keeps module state between requests
 * but drops it whenever Cloudflare recycles the isolate, and each isolate has
 * its own copy. That's fine for a fixture: the factory's checks care that the
 * app builds, deploys and answers, not that its data lasts.
 */
export class MemoryStore {
  #items = new Map<string, Item>();

  list(): Item[] {
    return [...this.#items.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  /** Adds the item, or returns the one already under that id with `created: false`. */
  add(input: NewItem, now = new Date()): { item: Item; created: boolean } {
    if (input.id) {
      const existing = this.#items.get(input.id);
      if (existing) return { item: existing, created: false };
    }
    const item: Item = {
      id: input.id ?? crypto.randomUUID(),
      title: input.title,
      createdAt: now.toISOString(),
    };
    this.#items.set(item.id, item);
    return { item, created: true };
  }
}
