
import faker from 'faker'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import express from 'express'
import User from './models/user.js'
import PostMessage from './models/postMessage.js'
import Comment from './models/comment.js'
import { createServer } from "http";
import bcrypt from 'bcryptjs'

dotenv.config()


const app = express();

const httpServer = createServer(app);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false } )
.then( () => httpServer.listen(PORT, ()=>console.log(`Server running on port ${PORT}`)) )
.catch( (err) => console.log(err, process.env.CONNECTION_URL) )


//Generates 5 users, 20 posts, pseudo-random amnt of comments, likes on all.
const usersPostsSeed = async () => {
    for(let i = 0; i<5;i++){
        const first = faker.name.firstName()
        const last = faker.name.lastName()
        const password = faker.datatype.number()
        const hashed = await bcrypt.hash(String(password), 12)
        const name = `${first} ${last}`
        const email = `${first}${last}@data.com`
        const user = await User.create({ email, password:hashed, name })
        console.log(user, password)
        
    }
    const users = await User.find()
    for(let i = 0; i<20;i++){
            const user = users[Math.floor(Math.random()*users.length)]
            let tags = []
            let possibleTags = ['cool','rad','awesome']
            for(let i = 0; i<(Math.floor(Math.random()*2)+1);i++){
                const indexOfRemoval = Math.floor(Math.random()*possibleTags.length)
                tags.push(possibleTags[indexOfRemoval])
                possibleTags.splice(indexOfRemoval,1)
                }
            const title = faker.lorem.words().split(' ').slice(0,2).join(' ')
            const lengthMessage = 10 + Math.floor(Math.random()*16)
            const message = faker.lorem.paragraph().split(' ').slice(0,lengthMessage).join(' ')
            const dateRangeNumber = Math.floor(Math.random()*3)
            const dateRange = dateRangeNumber === 0 ? Math.random()*7 : dateRangeNumber === 1 ? Math.random()*20 +7 : Math.random()*60 +30
            const currentDate = new Date()
            const randomPastDate = new Date(currentDate.getTime() - Math.floor(dateRange*3600000*24))
            const newPost = new PostMessage({title, message, name:user.name, creator:user._id, tags, selectedFile:'', createdAt: randomPastDate.toISOString()})
            await newPost.save()
    }
            const posts =  await PostMessage.find()
                for(let i = 0; i < 40; i++){
                    const postInQuestion = posts[Math.floor(Math.random()*posts.length)]
                    const userInQuestion = users[Math.floor(Math.random()*users.length)]
                    const comment = Math.round(Math.random()+1)
                    for(let i = 0; i < comment; i++){
                        const lengthMessage = 5 + Math.floor(Math.random()*21)
                        const message = faker.lorem.paragraph().split(' ').slice(0,lengthMessage).join(' ')
                        const currentDate = new Date()
                        const postCreationDate = new Date(postInQuestion.createdAt)
                        const dateRange = Math.floor(Math.random()*(currentDate.getTime() - postCreationDate.getTime()))
                        const randomPastDate = new Date(postCreationDate.getTime()+dateRange)
                        const newComment = new Comment({message, name:userInQuestion.name, creator:userInQuestion._id, belongsTo:postInQuestion._id, createdAt: randomPastDate.toISOString()})
                        await newComment.save()
                        console.log(`${userInQuestion.name} left a comment on ${postInQuestion.title} which was made by ${postInQuestion.name}`)
                        }
                }
    const comments = await Comment.find()
        for(let i = 0; i < users.length; i++){
            const userInQuestion = users[i]
            for(let i = 0; i < comments.length; i++){
                const commentInQuestion = comments[i]
                const like = Math.round(Math.random()*1)
                if(like === 0){
                    commentInQuestion.likes.push(userInQuestion._id)
                    await Comment.findByIdAndUpdate(commentInQuestion._id, commentInQuestion)
                }
            }
            for(let j =0; j < posts.length; j++){
                const postInQuestion = posts[j]
                const like = Math.round(Math.random())
                if(like === 1){
                    postInQuestion.likes.push(userInQuestion._id)
                    await PostMessage.findByIdAndUpdate(postInQuestion._id, postInQuestion)
                    console.log(`${userInQuestion.name} liked ${postInQuestion.title} which was made by ${postInQuestion.name}`)
                    }
            }
        }
        console.log(posts)
}
//combines the two to create users, make posts, then comment on them.
const seedDatabase = async () => {
    await usersPostsSeed()
    mongoose.disconnect().then( () => httpServer.close())
}
seedDatabase()
