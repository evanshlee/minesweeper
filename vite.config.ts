/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/minesweeper/",
  test: {
    environment: "happy-dom",
    setupFiles: "./src/setupTests.tsx",
    coverage: {
      include: ["src/**/*.ts?(x)"],
      exclude: ["src/**/*.stories.ts?(x)"],
      thresholds: {
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 70,
      },
    },
  },
});
