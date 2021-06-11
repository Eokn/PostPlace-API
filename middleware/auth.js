import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const auth = async (req,res,next) => {
    try {

        //Get the token and check if it is google or custom, decode the data and assign id. Pass info on.

        const token = req.headers.authorization.split(' ')[1]
        const isCustomAuth = token.length < 500;

        let decodedData;

        if(token && isCustomAuth) {
            decodedData = jwt.verify(token, process.env.JWT_SECRET)

            req.userId = decodedData?.id
        } else{
            decodedData = jwt.decode(token)

            req.userId = decodedData?.sub
        }
        next()
    } catch (error) {
        console.log(error)
    }
}

export default auth
