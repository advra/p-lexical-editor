/*
  This is the socketio server to broadcast presence and user redlines
*/

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = Number(process.env.NEXT_PUBLIC_SOCKET_PORT || 58854);
const FRONTEND_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/*
  Convenience api to check socket.io online status
*/
const app = express();
app.use(cors());
app.get('/status', (_req, res) => res.send('ONLINE'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    // allow list
    origin: [
      FRONTEND_ORIGIN,
      'https://eproc.com', // production origin, lowercase domain
    ],
    methods: ['GET', 'POST'],
    credentials: true, // if you need cookies
  },
});

// roomsPresence: Map<room, Map<socketId, { id, name }>>
const roomsPresence = new Map();

function getRoomPresence(room) {
  const m = roomsPresence.get(room);
  return m ? Array.from(m.values()) : [];
}
function emitPresence(room) {
  io.to(room).emit('presence:update', getRoomPresence(room));
}

// room scoped
io.on('connection', (socket) => {
  // keep track of which rooms this socket joined (for clean disconnect)
  socket.data.rooms = new Set();

  // JOIN
  socket.on('room:join', ({ room, name }) => {
    if (!room) return;
    socket.join(room);
    socket.data.rooms.add(room);

    if (!roomsPresence.has(room)) roomsPresence.set(room, new Map());
    roomsPresence.get(room).set(socket.id, {
      id: socket.id,
      name: name || `User ${socket.id.slice(0, 4)}`,
    });

    emitPresence(room); // -> presence:update to everyone in room
  });

  // LEAVE
  socket.on('room:leave', ({ room }) => {
    if (!room) return;
    socket.leave(room);
    socket.data.rooms.delete(room);

    const m = roomsPresence.get(room);
    if (m) {
      m.delete(socket.id);
      if (m.size === 0) roomsPresence.delete(room);
    }

    emitPresence(room);
  });

  // Presence request (send only to requester)
  socket.on('presence:request', ({ room }) => {
    if (!room) return;
    socket.emit('presence:update', getRoomPresence(room));
  });

  // Relay record patches to peers in the same room
  // client emits: socket.emit('record:patch', { room, record_id, patch })
  socket.on('record:patch', ({ room, record_id, patch }) => {
    if (!room || !record_id) return;
    socket.to(room).emit('record:patch', { record_id, patch });
  });

  // (Optional) Your previous custom action event—kept for compatibility:
  socket.on('send-recordId-actionPerformed', ({ room, ...action }) => {
    if (!room) return;
    socket.to(room).emit('receive-recordId-actionPerformed', action);
  });

  // DISCONNECT: clean up from all rooms we know about
  socket.on('disconnect', () => {
    for (const room of socket.data.rooms) {
      const m = roomsPresence.get(room);
      if (m) {
        m.delete(socket.id);
        if (m.size === 0) roomsPresence.delete(room);
        else emitPresence(room);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(
    `Socket.IO server on :${PORT} (CORS from: ${FRONTEND_ORIGIN}, https://eproc.com)`,
  );
});
