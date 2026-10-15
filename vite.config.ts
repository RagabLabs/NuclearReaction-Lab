import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],base:process.env.PORTABLE ? './' : '/NuclearReaction-Lab/',optimizeDeps:{entries:['src/main.tsx']},build:{outDir:'dist',rollupOptions:{output:{manualChunks:{charts:['recharts'],pdf:['jspdf'],math:['katex']}}}}});
