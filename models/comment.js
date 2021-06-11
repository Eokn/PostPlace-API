import mongoose from 'mongoose'

//Similar to postMessage, has a creator (user id) and a belongsTo (postMessage id) to link it to the other fields.
const commentSchema = mongoose.Schema({
    message: String,
    name: String,
    creator: String,
    belongsTo: String,
    likes: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const Comment = mongoose.model('Comment', commentSchema)

export default Comment