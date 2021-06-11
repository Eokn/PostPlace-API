import mongoose from 'mongoose'


//password is hashed, I don't have a password recovery system in place yet though, or a confirm password system.
const userSchema = mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    id: {type: String},
});

const User = mongoose.model('User', userSchema)

export default User