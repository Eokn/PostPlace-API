import PostMessage from '../models/postMessage.js'
import Comment from '../models/comment.js'
import mongoose from 'mongoose'

//Get 4 posts according to page number, send them back.
export const getPosts = async (req,res) => {
    const { page } = req.query
    try {
        const limit = 4
        const startIndex = (Number(page)-1)*limit
        const total = await PostMessage.countDocuments({})
        const posts =  await PostMessage.find().sort({_id:-1}).limit(limit).skip(startIndex)
        
        res.status(200).json({data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / limit)})
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

}

//Get 4 posts according to page number and query parameters.
export const getPostsWithSearch = async (req,res) => {

    const { searchQuery, tags, page } = req.query
    try {
        const limit = 4
        const startIndex = (Number(page)-1)*limit
        const title = new RegExp(searchQuery, 'i')
        const total = await PostMessage.countDocuments({ $or: [ { title }, { tags: { $in: tags.split(',') } } ] })
        const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ] }).sort({ _id: -1 }).limit(limit).skip(startIndex)
        console.log(posts)
        res.status(200).json({data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / limit)})
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

}

//It looks like PostMessage.aggregate(pipeline, options) is the only way for me to concisely find and order and cut out as needed.
//It will allow me to do exactly what I want to do: return exactly 5 posts, 1 guaranteed to be the matching Id one and 5 recommended ones, ordered by amount of likes using one query.
//I also get the comments for the post. I could probably do this in one aggregate somehow.
export const getPost = async (req,res) => {
    const { id } = req.params
    try {
        const post = await PostMessage.findById(id)
        const pipeline = [  
            { $match : { $or: [{tags: { $in: post.tags }}, {creator: { '$eq' : post.creator}}] } }, 
            { $addFields : { 
                searched: { $eq : [ '$_id', mongoose.Types.ObjectId(id) ] }, 
                numLikes: { $cond: { if: { $isArray: "$likes" }, then: { $size: "$likes" }, else: 0} } 
            } },
            { $sort : { searched: -1 , numLikes: -1 } },
            { $limit: 5 }
    ]
        const posts = await PostMessage.aggregate(pipeline)
        const commentSearch = [
            { $match : { belongsTo: id } },
            { $sort : { createdAt: 1 } },
            { $limit: 10 }
        ]
        const comments = await Comment.aggregate(commentSearch)
        res.status(200).json({posts, comments})
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

}

//Create a post, first checking if there's a userId (signed in)
export const createPost = async (req,res) => {

    if(!req.userId) return res.json({message: 'Unauthenticated'})

    const newPost = new PostMessage({...req.body, creator:req.userId, createdAt: new Date().toISOString()})
    
    try {
        await newPost.save()

        res.status(201).json(newPost)
    } catch (error) {
        res.status(409).json({ message: error.message })
    }

}

//Update a post, first checking if there's the user is the creator of the post in question.
export const updatePost = async (req, res) => {

    const { id: _id } = req.params;
    const post = req.body;
    
    if(!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that id');
    }

    const originalPost = await PostMessage.findById(_id);

    if(req.userId !== originalPost.creator) return res.json({message: 'Not allowed to do that!'})
    
    const updatedPost = await PostMessage.findByIdAndUpdate(_id, {...post, _id}, { new: true });
    res.json(updatedPost);
}

//Delete a post, first checking if there's the user is the creator of the post in question.
export const deletePost = async (req, res) => {
    const { id: _id } = req.params;

    if(!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(404).send('No post with that id');
    }

    const originalPost = await PostMessage.findById(_id);

    if(req.userId !== originalPost.creator) return res.json({message: 'Not allowed to do that!'})
    
    await PostMessage.findByIdAndRemove(_id)

    res.json({message: 'Post deleted successfully'})
}

//Update post, with toggle functionality on the array of userIds (likes)
export const likePost = async (req, res) => {

    const { id } = req.params;
    if(!req.userId) return res.json({message: 'Unauthenticated'})
    
    if(!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).send('No post with that id');
    }
    
    const post = await PostMessage.findById(id)
    
    const index = post.likes.findIndex((id)=> id === String(req.userId) )

    if (index === -1) {
        post.likes.push(req.userId)

    } else {
        post.likes = post.likes.filter((id)=> id !== String(req.userId))

    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {new: true})

    res.json(updatedPost)
}

//Create a comment, checks if logged in. Stores creator and belongsTo ids for later retrieval.
export const createComment = async (req,res) => {

    if(!req.userId) return res.json({message: 'Unauthenticated'})

    const newComment = new Comment({...req.body, creator:req.userId, createdAt: new Date().toISOString()})
    
    try {
        await newComment.save()
        console.log(newComment)
        res.status(201).json(newComment)
    } catch (error) {
        res.status(409).json({ message: error.message })
    }

}

//Another array filter/push toggle.
export const likeComment = async (req, res) => {

    const { _id, commentId } = req.params;
    
    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(404).send('No comment with that id');
    }
    
    const comment = await Comment.findById(commentId)

    if(req.userId !== comment.creator) return res.json({message: 'Not allowed to do that!'})
    
    const index = comment.likes.findIndex((id)=> id === String(req.userId) )

    if (index === -1) {
        comment.likes.push(req.userId)

    } else {
        comment.likes = comment.likes.filter((id)=> id !== String(req.userId))

    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId, comment, {new: true})

    res.json(updatedComment)
}

//Another delete with a condition to make sure the person deleting made it.
export const deleteComment = async (req, res) => {
    const { _id, commentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(404).send('No post with that id');
    }

    const originalComment = await Comment.findById(commentId);

    if(req.userId !== originalComment.creator) return res.json({message: 'Not allowed to do that!'})

    await Comment.findByIdAndRemove(commentId)

    res.json({message: 'Comment deleted successfully'})
}