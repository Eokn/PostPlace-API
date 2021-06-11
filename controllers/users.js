import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/user.js'
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
    try {
        const oldUser = await User.findOne({email})

        if(oldUser) return res.status(400).json({message: `User registered user with email: ${email} already exists.`})

        if(password !== confirmPassword) return res.status(400).json({message: "Passwords don't match."})

        const hashedPassword = await bcrypt.hash(password, 12)

        const result = await User.create({ email, password:hashedPassword, name:`${firstName} ${lastName}`})

        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JWT_SECRET, {expiresIn:'1h'})
        
        res.status(200).json({ result, token })

    } catch (error) {
        res.status(500).json({message:'Something went wrong.'})
    }
}