#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'vite';
import { exec } from 'child_process';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🌍 Starting Global Data Screensaver...\n');

// Start Vite dev server
const server = await createServer({
  root: projectRoot,
  server: {
    port: 5173,
    open: true
  }
});

await server.listen();

const url = 'http://localhost:5173';
console.log(`\n✨ Global Data Screensaver is running at: ${url}`);
console.log('\n📖 Press Ctrl+C to stop\n');

// Open browser
const openCommand = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open';
exec(`${openCommand} ${url}`);

