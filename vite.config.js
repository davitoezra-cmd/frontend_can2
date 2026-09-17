import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";

export default defineConfig({
    plugins: [react()],

    server: {
        host: "0.0.0.0",

        https: {
            key: fs.readFileSync("./localhost+2-key.pem"),
            cert: fs.readFileSync("./localhost+2.pem"),
        },

        proxy: {
            "/api": {
                target: "http://127.0.0.1:8000",
                changeOrigin: true,
                secure: false,
            },
        },
    },

    preview: {
        host: "0.0.0.0",

        https: {
            key: fs.readFileSync("./localhost+2-key.pem"),
            cert: fs.readFileSync("./localhost+2.pem"),
        },
    },
});