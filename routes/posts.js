import express from 'express'
import { getPosts, getPostsWithSearch, createPost, updatePost, deletePost, likePost, getPost, createComment, likeComment, deleteComment, deleteAllContent, deleteAccount, createChatMessage, getChatMessages } from '../controllers/posts.js'
import auth from '../middleware/auth.js';

const router = express.Router();

//Use auth when making important changes to the database.

router.get('/', getPosts)
router.get('/search', getPostsWithSearch)
router.post('/', auth, createPost)
router.delete('/deleteAllContent', auth, deleteAllContent)
router.delete('/deleteAccount', auth, deleteAccount)
router.get('/chatMessage', getChatMessages)
router.patch('/:id', auth, updatePost)
router.delete('/:id', auth, deletePost)
router.get('/:id', getPost)
router.patch('/:id/likePost', auth, likePost)
router.post('/:id/comments', auth, createComment)
router.patch('/:id/comments/:commentId/likeComment', auth, likeComment)
router.delete('/:id/comments/:commentId', auth, deleteComment)
router.post('/:id/chatMessage', auth, createChatMessage)
// router.delete('/:id/comments/:commentId', auth, deleteComment)


export default router