import mongoose from 'mongoose'

const chatRoomSchema = new mongoose.Schema({
  name: String,
  date: String
})

const chatRoom = mongoose.model('chatRoom', chatRoomSchema)

export default chatRoom