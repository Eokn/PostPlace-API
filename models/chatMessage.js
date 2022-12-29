import mongoose from 'mongoose'

//Similar to postMessage, has a creator (user id) and a belongsTo (postMessage id) to link it to the other fields.
const chatSchema = mongoose.Schema({
    message: String,
    sender: String,
    senderId: String,
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const ChatMessage = mongoose.model('ChatMessage', chatSchema)

export default ChatMessage