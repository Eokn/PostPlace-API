import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import postRoutes from './routes/posts.js'
import userRoutes from './routes/users.js'
import dotenv from 'dotenv'

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

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } )
.then( () => app.listen(PORT, ()=>console.log(`Server running on port ${PORT}`)) )
.catch( (err) => console.log(err, process.env.CONNECTION_URL) )