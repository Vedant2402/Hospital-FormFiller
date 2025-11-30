import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Basic Vite configuration for React project
export default defineConfig({
<<<<<<< HEAD
	plugins: [react()],
	server: {
		port: 5173,
		open: false
	},
	build: {
		sourcemap: true
	}
=======
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
>>>>>>> parent of bb5032e (Added authentication api, added cors route in vite)
});
