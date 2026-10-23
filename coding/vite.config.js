import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SteamTube serves this playground alongside its other games at /coding/.
// For a standalone domain, override with: npm run build -- --base=/
export default defineConfig({ base: '/coding/', plugins: [react()] });
