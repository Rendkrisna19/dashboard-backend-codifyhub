import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,          // ubah kalau mau, mis. 5174
    open: false,
    proxy: {
      "/api": {
        target: "http://localhost:5000", // backend
        changeOrigin: true
      }
    }
  }
});
