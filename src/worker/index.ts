import { createApp } from "./app";
import { MemoryStore } from "./store";

// One store per isolate, for as long as Cloudflare keeps the isolate.
export default createApp(new MemoryStore());
