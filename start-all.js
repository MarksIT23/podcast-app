/**
 * ═══════════════════════════════════════════════════════════════════════════
 *   PODCAST PLATFORM — MASTER STARTUP SCRIPT
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *   Launches all five processes that make up the decoupled platform:
 *
 *   1. Main API Server      (Express + SQLite)     → Port 3002
 *   2. Webhook Gateway       (Express relay)        → Port 3100
 *   3. Admin System          (Next.js + SQLite)     → Port 3003
 *   4. Editor Backend        (Express + MongoDB)    → Port 3005
 *   5. Editor Frontend       (Vue 3 + Vite)         → Port 3004
 *   6. Public User Frontend  (React + Vite)         → Port 5173
 *
 *   Usage:  node start-all.js
 *   Stop:   Ctrl+C (kills all child processes)
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const processes = [
  {
    name: 'Main API (SQLite)',
    cmd: 'node',
    args: ['index.js'],
    cwd: path.join(__dirname, 'server'),
    color: '\x1b[36m', // cyan
  },
  {
    name: 'Webhook Gateway',
    cmd: 'node',
    args: ['index.js'],
    cwd: path.join(__dirname, 'gateway'),
    color: '\x1b[33m', // yellow
  },
  {
    name: 'Admin (Next.js)',
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'subsystems', 'admin-next'),
    color: '\x1b[34m', // blue
  },
  {
    name: 'Editor Backend (MongoDB)',
    cmd: 'node',
    args: ['server.js'],
    cwd: path.join(__dirname, 'subsystems', 'editor-vue'),
    color: '\x1b[32m', // green
  },
  {
    name: 'Editor Frontend (Vue)',
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: path.join(__dirname, 'subsystems', 'editor-vue'),
    color: '\x1b[35m', // magenta
  },
  {
    name: 'Public App (React)',
    cmd: process.platform === 'win32' ? 'npm.cmd' : 'npm',
    args: ['run', 'dev'],
    cwd: __dirname,
    color: '\x1b[95m', // bright magenta
  },
];

const reset = '\x1b[0m';
const children = [];

console.log('\x1b[1m\x1b[97m');
console.log('═══════════════════════════════════════════════════════════════');
console.log('  PODCAST PLATFORM — MULTI-SYSTEM LAUNCHER');
console.log('═══════════════════════════════════════════════════════════════');
console.log(reset);
console.log('  Starting all subsystems...\n');

for (const proc of processes) {
  const child = spawn(proc.cmd, proc.args, {
    cwd: proc.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  child.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      console.log(`${proc.color}[${proc.name}]${reset} ${line}`);
    }
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    for (const line of lines) {
      // Filter out noisy npm warnings
      if (line.includes('npm warn') || line.includes('npm WARN')) return;
      console.log(`${proc.color}[${proc.name}]${reset} ${line}`);
    }
  });

  child.on('error', (err) => {
    console.error(`${proc.color}[${proc.name}]${reset} \x1b[31mFailed to start: ${err.message}${reset}`);
  });

  child.on('exit', (code) => {
    if (code !== null && code !== 0) {
      console.log(`${proc.color}[${proc.name}]${reset} \x1b[31mExited with code ${code}${reset}`);
    }
  });

  children.push(child);
  console.log(`  ${proc.color}✓${reset} ${proc.name} starting in ${proc.cwd}`);
}

console.log(`\n\x1b[1m  All ${processes.length} processes launched.\x1b[0m`);
console.log('\n  ┌──────────────────────────────────────────────────────┐');
console.log('  │  Admin System (Next.js + SQLite):   http://localhost:3003  │');
console.log('  │  Editor Frontend (Vue + MongoDB):   http://localhost:3004  │');
console.log('  │  Editor Backend API:                http://localhost:3005  │');
console.log('  │  Public User App (React + Vite):    http://localhost:5173  │');
console.log('  │  Main API Server:                   http://localhost:3002  │');
console.log('  │  Webhook Gateway:                   http://localhost:3100  │');
console.log('  └──────────────────────────────────────────────────────┘');
console.log('\n  Press Ctrl+C to stop all processes.\n');

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\x1b[33m  Shutting down all subsystems...\x1b[0m');
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
});

process.on('SIGTERM', () => {
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
});
