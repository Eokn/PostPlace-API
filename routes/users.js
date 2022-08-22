import express from 'express'
import { signIn, signUp, googleSignUp, getUserInfo} from '../controllers/users.js'
import auth from '../middleware/auth.js';

const router = express.Router();
//Using auth on googlesignup to catch the ID out of the header.
router.post('/signin', signIn)
router.post('/signup', signUp)
router.post('/googlesignup', auth, googleSignUp)
router.get('/:id', getUserInfo)


export default router