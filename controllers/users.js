import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

//Get the email/password, use to verify correct user and password via bcrypt, sign the jwt.
export const signIn = async (req,res) => {
    const { email, password } = req.body
    try {
        const oldUser = await User.findOne({ email })

        if(!oldUser) return res.status(404).json({message: `couldn't find registered user with email: ${email}`})

        const isPasswordCorrect = await bcrypt.compare(password, oldUser.password)

        if(!isPasswordCorrect) return res.status(400).json({message: `Password for ${email} not correct.`})

        const token = jwt.sign({ email: oldUser.email, id: oldUser._id }, process.env.JWT_SECRET, {expiresIn:'1h'})

        res.status(200).json({ result: oldUser, token })

    } catch (error) {
        res.status(500).json({message:'Something went wrong.'})
    }

}
//Get the formData, check if data allows for account to be made, hash the password, create a user, sign the jwt.
export const signUp = async (req,res) => {
    const { email,password,confirmPassword,firstName,lastName } = req.body
    console.log(req.body)
    try {
        //Guest account block, checks for certain values and creates an account.
        if(firstName==='' && lastName==='' && email==='guest@mail.com' && password==='guest123' && confirmPassword==='guest123') {
            console.log('guest tried to sign in')
            const random = Math.floor(Math.random()*1000000000)
            console.log(random)
            let newEmail = `guest${random}@mail.com`
            const oldUser = await User.findOne({newEmail})
            if(oldUser){newEmail = `guest${random+1}@mail.com`}
            const result = await User.create({ email:newEmail, password, name:`Guest ${random}`})
            const token = jwt.sign({ email: result.email, id: result._id }, process.env.JWT_SECRET, {expiresIn:'1h'})
            console.log(result)
            res.status(200).json({ result, token })

        }
        else{const oldUser = await User.findOne({email})

        if(oldUser) return res.status(400).json({message: `User registered user with email: ${email} already exists.`})

        if(password !== confirmPassword) return res.status(400).json({message: "Passwords don't match."})

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({ email, password:hashedPassword, name:`${firstName} ${lastName}`})

        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JWT_SECRET, {expiresIn:'1h'})
        
        res.status(200).json({ result, token })
}
    } catch (error) {
        res.status(500).json({message:'Something went wrong.'})
    }
}
export const googleSignUp = async (req,res) => {
    const { email, name } = req.body
    //req.userId will be sent over, can be used to check if account has been made.
    console.log(req.userId)
    const oldUser = await User.findOne({email})

    if(oldUser) return res.status(200).json({message:`google user ${req.userId} already recorded.`})

    //If there's already an account, let em know to move on. Otherwise, use the given token to create one.

    else{
        console.log('Now trying to create a user.')
        const dummyAccount = await User.create({ email, name, password: 'GoogleAccount', id:req.userId })
        res.status(200).json({ message:`Account created for ${req.userId}.` })
    }


}
//Gets posts and comments made by a specific user, orders by date and sends them back.
export const getUserInfo = async (req,res) => {
    const { id } = req.params
    console.log(`Getting user ${id}'s info - posts and comments`)
    const isGoogleId = !mongoose.Types.ObjectId.isValid(id)
    console.log(isGoogleId, 'This is the boolean saying what type of id we got.')
    try {
        const userSearch = [
            { $match : { _id: mongoose.Types.ObjectId(id) } },
            { $lookup: { from: 'postmessages', localField: 'name', foreignField: 'name', as: 'posts' } }, 
            { $lookup: { from: 'comments', localField: 'name', foreignField: 'name', as: 'comments' } },
            { $project: { name: 1, info: { $concatArrays: ['$posts', '$comments'] } } }
        ]
        const userInfo = await User.aggregate(userSearch)
        userInfo[0].info = userInfo[0].info.sort((a,b) => b.createdAt - a.createdAt)
        res.status(200).json({userInfo})
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

}