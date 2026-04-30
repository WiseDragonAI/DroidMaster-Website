/*
 * WHY: The OSS website must build independently from the DroidFleet mock frontend.
 * WHAT: Defines the canonical landing page and the archived clone page as Vite inputs.
 */

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

export default {
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(rootDir, "index.html"),
        archive: resolve(rootDir, "archive.html"),
      },
    },
  },
};
