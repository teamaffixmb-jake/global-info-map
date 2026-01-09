#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { extname } from 'path';
import { exec } from 'child_process';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, '..', 'dist');

console.log('🌍 Starting Global Data Screensaver...\n');

// MIME types for common files
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wasm': 'application/wasm',
  '.xml': 'application/xml'
};

// Create a simple static file server
const server = createServer((req, res) => {
  let filePath = join(distPath, req.url === '/' ? 'index.html' : req.url);
  
  if (!existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
    return;
  }

  if (statSync(filePath).isDirectory()) {
    filePath = join(filePath, 'index.html');
  }

  const ext = extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';

  try {
    const content = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  }
});

const PORT = 5173;
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`✨ Global Data Screensaver is running at: ${url}`);
  console.log('\n📖 Press Ctrl+C to stop\n');

  // Open browser
  const openCommand = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open';
  exec(`${openCommand} ${url}`);
});

