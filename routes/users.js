import express from 'express'
import { signIn, signUp, getUserInfo} from '../controllers/users.js'

const router = express.Router();

router.post('/signin', signIn)
router.post('/signup', signUp)
router.get('/:id', getUserInfo)


export default router