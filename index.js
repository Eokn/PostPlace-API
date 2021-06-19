import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import postRoutes from './routes/posts.js'
import userRoutes from './routes/users.js'
import dotenv from 'dotenv'
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
dotenv.config()

//set up server and encodings, set up routes, set up mongoDB connection.

app.use(express.urlencoded({ limit: '10mb', extended:true}))
app.use(express.json({ limit: '10mb', extended:true}))
app.use(cors())

app.use('/posts', postRoutes)
app.use('/users', userRoutes)

app.get('/', (req,res)=>{
    res.send('Connected to API successfully.')
})

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", 'PUT','PATCH','DELETE']
  }
});

//socket.io ons and emits.
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on('updatePost', data => {
    io.emit('updatedPost', data)
  })

  socket.on('deletePost', data => {
    io.emit('deletedPost', data)
  })

  socket.on('addPost', data => {
    io.emit('addedPost', data)
  })

  socket.on('addComment', data => {
    io.emit('addedComment', data)
  })

  socket.on('updateComment', data => {
    io.emit('updatedComment', data)
  })

  socket.on('deleteComment', data => {
    io.emit('deletedComment', data)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } )
.then( () => httpServer.listen(PORT, ()=>console.log(`Server running on port ${PORT}`)) )
.catch( (err) => console.log(err, process.env.CONNECTION_URL) )