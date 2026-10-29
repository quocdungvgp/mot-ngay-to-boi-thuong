// Một Ngày Làm Tổ Bồi Thường – máy chủ chơi nhiều người
// Chạy: npm install && node server.js   (mặc định cổng 8080, đổi bằng biến PORT)
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { WebSocketServer } = require('ws');

const PORT = +process.env.PORT || 8080;
const PUB = path.join(__dirname, 'public');
const MAX_PER_ROOM = 30;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end(); }
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(PUB, p));
  if (!file.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Không tìm thấy'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 4096 });
const rooms = new Map(); // roomId -> Set<ws>
const rid = () => Math.random().toString(36).slice(2, 7);
const clean = (s, n) => String(s || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
const num = (v, a, b) => (Number.isFinite(+v) ? Math.min(b, Math.max(a, +v)) : a);

function send(ws, obj) { if (ws.readyState === 1) ws.send(JSON.stringify(obj)); }
function broadcast(room, obj) { const s = rooms.get(room); if (s) for (const c of s) send(c, obj); }
function leave(ws) {
  const s = rooms.get(ws.room); if (!s) return;
  s.delete(ws);
  if (!s.size) rooms.delete(ws.room);
  else broadcast(ws.room, { t: 'sys', text: `${ws.name} đã rời xóm.` });
  ws.room = null;
}
function join(ws, want) {
  let room = null;
  if (want && /^[a-z0-9]{3,12}$/.test(want)) {
    const s = rooms.get(want);
    if (!s || s.size < MAX_PER_ROOM) room = want;
  }
  if (!room) for (const [id, s] of rooms) if (s.size < MAX_PER_ROOM) { room = id; break; }
  if (!room) room = rid();
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(ws);
  ws.room = room;
  send(ws, { t: 'welcome', id: ws.id, room, count: rooms.get(room).size });
  broadcast(room, { t: 'sys', text: `${ws.name} (${ws.role}) vào xóm.` });
}

wss.on('connection', ws => {
  ws.id = rid(); ws.name = 'Cán bộ'; ws.role = ''; ws.st = [0, 0, 0, 1, 0, 0, 50]; ws.lastChat = 0; ws.alive = true;
  ws.on('pong', () => { ws.alive = true; });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m !== 'object') return;
    if (m.t === 'hello') {
      ws.name = clean(m.name, 20) || 'Cán bộ';
      ws.role = clean(m.role, 40);
      const want = clean(m.room, 12).toLowerCase();
      if (ws.room && (!want || want === ws.room)) return send(ws, { t: 'welcome', id: ws.id, room: ws.room, count: rooms.get(ws.room).size });
      if (ws.room) leave(ws);
      join(ws, want);
    } else if (m.t === 'st' && Array.isArray(m.s)) {
      const s = m.s;
      ws.st = [num(s[0], 0, 1100), num(s[1], 0, 1500), num(s[2], -1, 1), num(s[3], -1, 1), s[4] ? 1 : 0, num(s[5], 0, 99) | 0, num(s[6], -999, 9999) | 0];
    } else if (m.t === 'chat' && ws.room) {
      const now = Date.now(); if (now - ws.lastChat < 900) return; ws.lastChat = now;
      const text = clean(m.text, 120); if (!text) return;
      broadcast(ws.room, { t: 'chat', id: ws.id, name: ws.name, text });
    }
  });
  ws.on('close', () => leave(ws));
});

// Gửi ảnh chụp trạng thái 10 lần/giây
setInterval(() => {
  for (const [room, set] of rooms) {
    const p = [...set].map(c => [c.id, c.name, c.role, ...c.st]);
    broadcast(room, { t: 'snap', p });
  }
}, 100);
// Dọn kết nối chết
setInterval(() => { for (const ws of wss.clients) { if (!ws.alive) { ws.terminate(); continue; } ws.alive = false; ws.ping(); } }, 15000);

server.listen(PORT, () => {
  console.log(`\n  Một Ngày Làm Tổ Bồi Thường đang chạy:`);
  console.log(`  - Máy này:      http://localhost:${PORT}`);
  for (const list of Object.values(os.networkInterfaces()))
    for (const a of list || []) if (a.family === 'IPv4' && !a.internal) console.log(`  - Cùng wifi/LAN: http://${a.address}:${PORT}`);
  console.log(`\n  Mỗi xóm tối đa ${MAX_PER_ROOM} người. Ctrl+C để tắt.\n`);
});
