import path from 'path'
import { fileURLToPath } from 'url'

import express, { json, urlencoded } from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const app = express()
const port = 3000

const server = createServer(app)

import logger from 'morgan'
import dateFormat from 'dateformat'

const now = new Date()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const io = new Server(server, {
  cors: {
    origin: 'https://vue-node-chat-app.netlify.app/',
  },
})


app.use(logger('dev'))
app.use(json())
app.use(urlencoded({ extended: false }))

import './config/mongo.js'

import Msg from './models/messages.js'
import chatRoom from './models/chatRoom.js'

let users = []
let messages = []
let rooms = []
let roomId = ''


chatRoom.find((err, result) => {
    if (err) throw err
    
    rooms = result
})


io.on('connection', (socket) => {

    socket.emit('initChat', {
        messages: messages
    })

    socket.emit('initRooms', {
        rooms: rooms
    })
  
    socket.username = 'Anonymous'
  
    //listen on Change Username
    socket.on('enterUsername', (user) => {
        socket.username = user.username
        users.push({ id: socket.id, username: socket.username })
        updateUsernames()
        updateRooms()
        io.emit('userConnected', socket.username)
        console.log(`${socket.username} user connected`)
    })
  
    // Update Usernames on client side
    const updateUsernames = () => {
        io.emit('getUsers', users)
    }
    const updateRooms = () => {
        io.emit('getRooms', rooms)
    }
  
    // Listen on New Message
  
    socket.on('newMessage', (data) => {
        let message = new Msg({
            message: data.message,
            username: socket.username,
            date: dateFormat(now, 'dd-mm-yyyy,  HH:MM'),
            userId: socket.id,
            room: data.room._value
        })
        
        // Broadcast The New Message
        
        message.save((err, result) => {
            if (err) throw err
            messages.push(result)
            io.emit('newMessage', result)
        })
    })

    socket.on('newRoom', (data) => {
        console.log("creando nueva room")
        let room = new chatRoom({
            name: data.roomName,
            date: dateFormat(now, 'dd-mm-yyyy,  HH:MM'),
        })
        // Broadcast The New Message
        room.save((err, result) => {
            if (err) throw err
            rooms.push(result)
            io.emit('newRoom', result)
        })
    })

    socket.on('isTyping', () => {
        socket.broadcast.emit('isTyping', socket.username)
    })

    socket.on('newRoomId', (data) => {
        roomId = data._value
        Msg.find({room: roomId}, (err, result) => {
            if (err) throw err
            console.log("the result is", result)
            messages = result
            io.emit('refreshChat', result)
        })
    })
    
    socket.on('stopTyping', (data) => {
        socket.broadcast.emit('stopTyping', data)
    })
    
    socket.on('deleteOne', (data, err) => {
        if (err) throw err

        Msg.deleteOne({ _id: data._id })
    })
    
    // Disconnect
    
    socket.on('disconnect', () => {
        io.emit('userDisconnected', socket.username)
        users = users.filter(function (user) {
            return user.id != socket.id
        })
        // Update the users list
        updateUsernames()
        console.log(`${socket.username} has leaved`)
    })
})
// Handle production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, './public/')))
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(__dirname, './public/', 'index.html'))
    })
}
app.get('/',(req, res)=>{
    res.send("hello world")
})
server.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})