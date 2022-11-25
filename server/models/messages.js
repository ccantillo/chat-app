import mongoose from 'mongoose'
const msgSchema = new mongoose.Schema({
  message: String,
  username: String,
  date: String,
  userId: String,
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'chatRoom'
  }
})

const Msg = mongoose.model('msg', msgSchema)

export default Msg
