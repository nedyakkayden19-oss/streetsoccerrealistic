const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true, credentials: true } });
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const lobbies = new Map();

app.use(express.static(publicDir));
app.get('/', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));

function makeCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code;
  do { code = Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(''); }
  while (lobbies.has(code));
  return code;
}
function lobbySummary(lobby) {
  return { code: lobby.code, hostId: lobby.hostId, players: [...lobby.players].map(id => ({ id })) };
}
function leave(socket) {
  const code = socket.data.lobbyCode;
  if (!code) return;
  const lobby = lobbies.get(code);
  socket.data.lobbyCode = null;
  if (!lobby) return;
  if (socket.id === lobby.hostId) {
    io.to(code).emit('lobby-closed', { reason: 'The host closed the lobby.' });
    for (const id of lobby.players) {
      const member = io.sockets.sockets.get(id);
      if (member) { member.leave(code); member.data.lobbyCode = null; }
    }
    lobbies.delete(code);
    return;
  }
  lobby.players.delete(socket.id);
  socket.leave(code);
  io.to(code).emit('lobby-updated', lobbySummary(lobby));
}

io.on('connection', socket => {
  socket.on('create-lobby', (payload, callback) => {
    leave(socket);
    const code = makeCode();
    const lobby = { code, hostId: socket.id, players: new Set([socket.id]) };
    lobbies.set(code, lobby);
    socket.join(code);
    socket.data.lobbyCode = code;
    if (typeof callback === 'function') callback({ ok: true, lobby: { code, hostId: socket.id } });
    io.to(code).emit('lobby-updated', lobbySummary(lobby));
  });

  socket.on('join-lobby', (payload, callback) => {
    const code = String(payload && payload.code || '').toUpperCase().replace(/[^A-Z]/g, '');
    const lobby = lobbies.get(code);
    if (!lobby) return typeof callback === 'function' && callback({ ok: false, error: 'That lobby code was not found.' });
    if (lobby.players.size >= 20) return typeof callback === 'function' && callback({ ok: false, error: 'That lobby is full.' });
    leave(socket);
    lobby.players.add(socket.id);
    socket.join(code);
    socket.data.lobbyCode = code;
    if (typeof callback === 'function') callback({ ok: true, lobby: { code, hostId: lobby.hostId } });
    io.to(code).emit('lobby-updated', lobbySummary(lobby));
  });

  socket.on('game-event', packet => {
    const code = socket.data.lobbyCode;
    if (!code || !lobbies.has(code) || !packet || typeof packet.event !== 'string') return;
    socket.to(code).emit('game-event', { event: packet.event, data: packet.data, peer: socket.id });
  });

  socket.on('leave-lobby', callback => {
    leave(socket);
    if (typeof callback === 'function') callback({ ok: true });
  });
  socket.on('disconnect', () => leave(socket));
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`Street Soccer 3D multiplayer server running at http://localhost:${PORT}`));
}

module.exports = { app, server, io, lobbies };
