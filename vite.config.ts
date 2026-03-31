import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // 启用 chunk 大小警告阈值
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        // 手动拆分依赖包，利用浏览器长效缓存
        manualChunks: {
          // React 核心
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI 组件库
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
          ],
          // 图表库（体积较大，单独拆出）
          'vendor-charts': ['recharts'],
          // 国际化
          'vendor-i18n': ['i18next', 'react-i18next'],
          // 表单
          'vendor-form': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
  },
});
