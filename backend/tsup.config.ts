// backend/tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/app.ts"],
  format: ["esm"],
  target: "node24",
  outDir: "dist",
  clean: true, // Tự động xóa sạch thư mục dist trước khi build
  sourcemap: false, // Giữ sourcemap để trace lỗi production
  minify: true, // Giữ code dễ đọc khi debug (có thể đổi sang true nếu muốn nén)
  splitting: true,
  dts: false, // API backend không cần xuất file .d.ts
  shims: true, // Hỗ trợ import.meta và __dirname trong ESM
});
