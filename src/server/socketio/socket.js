/*
  This is the socketio server to broadcast presence and user redlines
*/

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const PORT = Number(process.env.NEXT_PUBLIC_SOCKET_PORT || 5772);
const FRONTEND_ORIGIN =
  process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5770';

/*
  Convenience api to check socket.io online status
*/
const app = express();
app.use(cors());
app.get('/status', (_req, res) => res.send('ONLINE'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'POST', 'DELETE'],
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
    console.log(
      '[socket] User joining room:',
      room,
      'name:',
      name,
      'socketId:',
      socket.id,
    );
    if (!room) {
      console.log('[socket] No room specified, ignoring join request');
      return;
    }
    socket.join(room);
    socket.data.rooms.add(room);

    if (!roomsPresence.has(room)) roomsPresence.set(room, new Map());
    roomsPresence.get(room).set(socket.id, {
      id: socket.id,
      name: name || `User ${socket.id.slice(0, 4)}`,
    });

    console.log(
      '[socket] User successfully joined room:',
      room,
      'total users in room:',
      roomsPresence.get(room).size,
    );

    // presence:update to everyone in room
    emitPresence(room);
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

  /*
    Presence is to display users in the current room (proc)
  */

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

  /*
    Redline Events to properly display users any redlines in the current proc (aka room)
  */

  // Handle redline creation events
  socket.on('redline:create', ({ room, redline }) => {
    if (!room || !redline) return;
    socket.to(room).emit('redline:created', { redline });
  });

  // Handle redline update events
  socket.on('redline:update', ({ room, redlineId, patch }) => {
    if (!room || !redlineId) return;
    socket.to(room).emit('redline:updated', { redlineId, patch });
  });

  // Handle redline deletion events
  socket.on('redline:delete', ({ room, redlineId }) => {
    if (!room || !redlineId) return;
    socket.to(room).emit('redline:deleted', { redlineId });
  });

  // Handle session record updates
  socket.on(
    'session:record-updated',
    ({ room, sessionId, recordId, state }) => {
      if (!room || !sessionId || !recordId) return;
      socket.to(room).emit('session:record-updated', {
        sessionId,
        recordId,
        state,
      });
    },
  );

  // Handle session status changes
  socket.on(
    'session:status-changed',
    ({ room, sessionId, status, changedBy }) => {
      console.log('[socket] Received session:status-changed:', {
        room,
        sessionId,
        status,
        changedBy,
      });

      if (!room || !sessionId) {
        console.log('[socket] Missing room or sessionId, ignoring event');
        return;
      }

      const statusUpdate = {
        sessionId,
        status,
        changedBy,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all users in the room (including sender)
      console.log(`[socket] Broadcasting to room ${room}:`, statusUpdate);
      io.to(room).emit('session:status-updated', statusUpdate);

      console.log(
        `[socket] Session ${sessionId} status changed to ${status} by ${changedBy} in room ${room}`,
      );
    },
  );

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
