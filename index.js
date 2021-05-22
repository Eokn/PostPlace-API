import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
//this is importing 'router' from posts but renaming it to postRoutes. I believe this can only be done if you export default the thing.
import postRoutes from './routes/posts.js'
import dotenv from 'dotenv'

const app = express();
dotenv.config()

//The actual path is decided right here. if I change /posts to /55rkgr I have to send my get request to /55rkgr, regardless of what the routes folder and js file are called. 
//TLDR: THE ACTUAL PATH IS DECIDED RIGHT HERE, NOT IN THE ROUTES FOLDER.

app.use(express.urlencoded({ limit: '10mb', extended:true}))
app.use(express.json({ limit: '10mb', extended:true}))
app.use(cors())

app.use('/posts', postRoutes)

app.get('/', (req,res)=>{
    res.send('Connected to API successfully.')
})

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } )
.then( () => app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`)) )
.catch( (err) => console.log(err.message, process.env.CONNECTION_URL, 'wtf') )