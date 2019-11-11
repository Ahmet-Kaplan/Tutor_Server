/**
 * Processes incoming socket messages
 */

const passportSocketIo = require('passport.socketio')
const cookieParser = require('cookie-parser')

const Session = require('../../models/Session.js')

const config = require('../../config.js')
const SessionCtrl = require('../../controllers/SessionCtrl.js')
const SocketService = require('../../services/SocketService.js')

// todo handle errors in try-catch blocks

module.exports = function (io, sessionStore) {
  const socketService = SocketService(io)
  const sessionCtrl = SessionCtrl(socketService)

  // Authentication for sockets
  io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'connect.sid',
    secret: config.sessionSecret,
    store: sessionStore
  }))

  io.on('connection', async function (socket) {
    // store user and socket in SocketService
    const connectPromise = socketService.connectUser(socket.request.user._id, socket)

    // Session management
    socket.on('join', async function (data) {
      if (!data || !data.sessionId) {
        return
      }

      // wait for socketService.connectUser to complete before joining
      await connectPromise.then(() => {
        sessionCtrl.join(
          socket,
          {
            sessionId: data.sessionId,
            user: socket.request.user
          }
        )
      })
    })

    socket.on('disconnect', function () {
      console.log('Client disconnected')

      socketService.disconnectUser(socket)
    })

    socket.on('list', async function () {
      const sessions = await Session.getUnfulfilledSessions()
      io.emit('sessions', sessions)
    })

    socket.on('typing', function (data) {
      socket.broadcast.to(data.sessionId).emit('is-typing')
    })

    socket.on('notTyping', function (data) {
      socket.broadcast.to(data.sessionId).emit('not-typing')
    })

    socket.on('message', async function (data) {
      if (!data.sessionId) return

      try {
        await sessionCtrl.message(data)
      } catch (err) {
        console.log(err)
        console.log('Could not deliver message')
        io.emit('error', err.toString())
      }
    })

    // Whiteboard interaction
    // all of this is now blocked for non-participants
    const whiteboardAccessError = new Error('Only session participants can access whiteboard')

    socket.on('canvasLoaded', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('size', {
        height: data.height
      })
    })

    socket.on('drawClick', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('draw', {
        x: data.x,
        y: data.y,
        type: data.type
      })
    })

    socket.on('saveImage', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('save')
    })

    socket.on('undoClick', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('undo')
    })

    socket.on('clearClick', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      io.to(data.sessionId).emit('clear')
    })

    socket.on('drawing', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('draw')
    })

    socket.on('end', async function (data) {
      if (!data || !data.sessionId) return

      const session = await Session.findById(data.sessionId)

      sessionCtrl.verifySessionParticipant(
        session,
        socket.request.user,
        whiteboardAccessError)

      session.saveWhiteboardUrl(data.whiteboardUrl)
      socket.broadcast.to(data.sessionId).emit('end', data)
    })

    socket.on('changeColor', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('color', data.color)
    })

    socket.on('changeWidth', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('width', data.width)
    })

    socket.on('dragStart', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('dstart', {
        x: data.x,
        y: data.y,
        color: data.color
      })
    })

    socket.on('dragAction', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('drag', {
        x: data.x,
        y: data.y,
        color: data.color
      })
    })

    socket.on('dragEnd', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      socket.broadcast.to(data.sessionId).emit('dend', {
        x: data.x,
        y: data.y,
        color: data.color
      })
    })

    socket.on('insertText', async function (data) {
      if (!data || !data.sessionId) return

      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      io.to(data.sessionId).emit('text', {
        text: data.text,
        x: data.x,
        y: data.y
      })
    })

    socket.on('resetScreen', async function (data) {
      await sessionCtrl.verifySessionParticipantBySessionId(
        data.sessionId,
        socket.request.user,
        whiteboardAccessError)

      io.to(data.sessionId).emit('reset')
    })
  })
}
