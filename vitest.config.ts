import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({plugins:[react()],test:{include:['tests/**/*.test.{ts,tsx}'],environment:'node',reporters:['default','json'],outputFile:{json:'reports/vitest-results.json'}}});
