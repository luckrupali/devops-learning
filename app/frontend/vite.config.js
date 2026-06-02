import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        // During development, forward /api requests to backend
        proxy: {
            '/api': 'http://localhost:5000'
        }
    }
});
