// relay.mjs: sits between Claude Code and the Anthropic API. Passes every request through unchanged,
// and logs a copy of each request body to relay/requests.jsonl, so you can read exactly what the model gets.
//   node relay/relay.mjs
//   ANTHROPIC_BASE_URL=http://localhost:8787 claude
import fs from 'node:fs';
import http from 'node:http';

const UPSTREAM = 'https://api.anthropic.com';
const log = fs.createWriteStream(process.env.RELAY_LOG ?? new URL('./requests.jsonl', import.meta.url), { flags: 'a' });
// Hop-by-hop headers stay on this side; everything else goes through as it came.
const SKIP = new Set(['host', 'connection', 'content-length', 'accept-encoding', 'upgrade', 'keep-alive', 'transfer-encoding', 'te', 'trailer', 'proxy-connection']);

http.createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const body = Buffer.concat(chunks);
  if (req.url.startsWith('/v1/messages') && body.length) {
    log.write(JSON.stringify({ t: new Date().toISOString(), url: req.url, body: JSON.parse(body) }) + '\n');
  }
  const headers = Object.fromEntries(Object.entries(req.headers).filter(([k]) => !SKIP.has(k)));
  let up;
  try {
    up = await fetch(UPSTREAM + req.url, { method: req.method, headers, body: body.length ? body : undefined });
  } catch (err) {
    res.writeHead(502).end(String(err.cause ?? err));
    return;
  }
  res.writeHead(up.status, Object.fromEntries([...up.headers].filter(([k]) => !['content-encoding', 'content-length'].includes(k))));
  if (up.body) for await (const c of up.body) res.write(c);
  res.end();
}).listen(8787, () => console.log('relay on http://localhost:8787 → ' + UPSTREAM));
