/**
 * Gateway — Webhook relay between subsystems
 * 
 * Receives webhooks from Admin/Editor and relays to subscribed subsystems.
 * Port 3100 by default, configurable via GATEWAY_PORT env.
 */

import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.GATEWAY_PORT || 3100;
const SUBSCRIBERS_PATH = join(__dirname, 'subscribers.json');

const app = express();
app.use(express.json());

// Load persisted subscribers
function loadSubscribers() {
  if (!existsSync(SUBSCRIBERS_PATH)) return [];
  try {
    return JSON.parse(readFileSync(SUBSCRIBERS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function saveSubscribers(subscribers) {
  writeFileSync(SUBSCRIBERS_PATH, JSON.stringify(subscribers, null, 2));
}

let subscribers = loadSubscribers();

// Subscribe a subsystem to events
app.post('/subscribe', (req, res) => {
  const { subsystem, url, events } = req.body;
  if (!subsystem || !url || !events) {
    return res.status(400).json({ error: 'Missing required fields: subsystem, url, events' });
  }

  // Remove existing subscription for this subsystem
  subscribers = subscribers.filter(s => s.subsystem !== subsystem);
  subscribers.push({ subsystem, url, events, addedAt: new Date().toISOString() });
  saveSubscribers(subscribers);

  console.log(`[Gateway] ${subsystem} subscribed at ${url} for events: ${events.join(', ')}`);
  res.json({ success: true, subscriber: { subsystem, url, events } });
});

// Unsubscribe
app.post('/unsubscribe', (req, res) => {
  const { subsystem } = req.body;
  const removed = subscribers.filter(s => s.subsystem === subsystem);
  subscribers = subscribers.filter(s => s.subsystem !== subsystem);
  saveSubscribers(subscribers);
  res.json({ success: true, removed: removed.length });
});

// Webhook receive — event-based relay
app.post('/webhook/:event', async (req, res) => {
  const { event } = req.params;
  const payload = req.body;

  console.log(`[Gateway] Received event: ${event}`, JSON.stringify(payload).slice(0, 200));

  // Find subscribers for this event
  const targets = subscribers.filter(s => s.events.includes(event));

  if (targets.length === 0) {
    return res.json({ received: true, relayed: 0 });
  }

  // Fire-and-forget to each subscriber with retry
  const results = await Promise.allSettled(
    targets.map(sub => relayWithRetry(sub.url, event, payload, 3))
  );

  const relayed = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  if (failed > 0) {
    console.warn(`[Gateway] ${failed}/${targets.length} relays failed for event: ${event}`);
  }

  res.json({ received: true, relayed, failed, total: targets.length });
});

// Retry helper with exponential backoff
async function relayWithRetry(url, event, payload, maxRetries) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, payload, timestamp: new Date().toISOString() }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      console.log(`[Gateway] Relayed ${event} to ${url} (attempt ${attempt})`);
      return true;
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
        console.warn(`[Gateway] Retry ${attempt}/${maxRetries} for ${url} in ${delay}ms: ${err.message}`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error(`[Gateway] Failed to relay ${event} to ${url} after ${maxRetries} attempts: ${err.message}`);
        throw err;
      }
    }
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', subscribers: subscribers.length, uptime: process.uptime() });
});

// List subscribers (for debugging)
app.get('/subscribers', (req, res) => {
  res.json({ subscribers });
});

app.listen(PORT, () => {
  console.log(`[Gateway] Running on port ${PORT}`);
  console.log(`[Gateway] ${subscribers.length} subscribers loaded from disk`);
});
