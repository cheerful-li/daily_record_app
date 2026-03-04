import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import tailwindcss from "@tailwindcss/vite"
// import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 关键配置：禁用 CSS 拆分（确保 CSS 内联到 HTML）
  build: {
    cssCodeSplit: false,
    // 可选：压缩资源（进一步减小文件体积）
    minify: "terser",
    // 可选：如果有大图片，调整资产内联阈值（默认 4kb 内联，这里设为 10MB）
    assetsInlineLimit: 10 * 1024 * 1024,
  },
  // 单文件打包时 base 必须设为 '' 或 '.'（避免路径错误）
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
