import express from 'express'
import { getPosts, getPostsWithSearch, createPost, updatePost, deletePost, likePost, getPost, createComment, likeComment, deleteComment } from '../controllers/posts.js'
import auth from '../middleware/auth.js';

const router = express.Router();

//Use auth when making changes to the database.

router.get('/', getPosts)
router.get('/search', getPostsWithSearch)
router.post('/', auth, createPost)
router.patch('/:id', auth, updatePost)
router.delete('/:id', auth, deletePost)
router.get('/:id', getPost)
router.patch('/:id/likePost', auth, likePost)
router.post('/:id/comments', auth, createComment)
router.patch('/:id/comments/:commentId/likeComment', auth, likeComment)
router.delete('/:id/comments/:commentId', auth, deleteComment)

export default router

//   Perhaps for the socket.io thing, I write the server code, and listen for a bunch of emits, changing some variable in it which decides what to do next? Maybe in the postsSlice after the API call I emit something which gives all the info to the socket on the server about what action to repeat and what parameters were given?

//Alright, pretty sure something like that will work. When dispatching one of the three actions, after getting back the data use socket.emit to throw back a copy of the data and on here, the server, have some socket.ons that match those which will clear an interval (all 3 of them will be the same interval so they will clear eachother) and then start an interval of X seconds where the function in question will be repeatedly called. I will then have to recieve the info on the client again, but this time it will be outside the previous dispatch so the way the repeat-data-recievers should look on the client is socket.on(nameOfThingDone, () => {dispatch(quickOverwritePosts)}) or something.

//So to restate, I'll start in the client. Try to emit something mid-dispatch like I do with history.