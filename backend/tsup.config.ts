// backend/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts"],
  format: ["esm"],
  target: "node24",
  outDir: "dist",
  clean: true,
  bundle: true,
  splitting: false, // Backend APIs with a single entry point do not need code splitting
  sourcemap: false,
  minify: true,
  shims: true, // Polyfills __dirname and __filename in ESM
  skipNodeModulesBundle: true, // Keep node_modules external (express, pg, etc.)
  outExtension() {
    return {
      js: ".js", // Guarantees output is always dist/app.js
    };
  },
});
