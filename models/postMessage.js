import mongoose from 'mongoose'

//Can store a base64 string as selectedFile, likes is an array of user ids, creator is a user id too.
const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: String,
    likes: {
        type: [String],
        default: []
    },
    createdAt: {
        type: Date,
        default: new Date()
    }
});

const PostMessage = mongoose.model('PostMessage', postSchema)

export default PostMessage