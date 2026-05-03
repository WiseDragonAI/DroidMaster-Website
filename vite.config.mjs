/*
 * WHY: The OSS website must build independently from the DroidFleet mock frontend.
 * WHAT: Defines the canonical landing page, archive page, version selector, and served V4 route as Vite inputs.
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
        versions: resolve(rootDir, "versions/index.html"),
        versionInitialFlashy: resolve(rootDir, "versions/initial-flashy/index.html"),
        versionProd: resolve(rootDir, "versions/prod/index.html"),
        versionLocalLatest: resolve(rootDir, "versions/local-latest/index.html"),
        versionDesignSystem: resolve(rootDir, "versions/design-system/index.html"),
      },
    },
  },
};
