import PostMessage from '../models/postMessage.js'
import Comment from '../models/comment.js'
import mongoose from 'mongoose'

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

export const getPost = async (req,res) => {
    const { id } = req.params
    try {
        const post = await PostMessage.findById(id)
        // const posts = await PostMessage.find({ $or: [ { _id: id }, { tags: { $in: post.tags } } ] } ).sort({ "_id": {$eq: id} }).limit(2)
        //It looks like PostMessage.aggregate(pipeline, options) is the only way for me to concisely find and order and cut out as needed.
        //It will allow me to do exactly what I want to do: return exactly 6 posts, 1 guaranteed to be the matching Id one and 5 recommended ones, ordered by amount of likes using one query.

        //where post.tags is right now I want to have some expression which takes the id, finds the post with the id, and returns the property tags from it. This will allow me to completely replace the extra query to the database I'm doing with the PostMessage.findById(id).
        //I want to also match for posts which are created by the same user as the post specified.
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
    console.log(post.creator)
        const commentSearch = [
            { $match : { belongsTo: id } },
            { $sort : { createdAt: 1 } },
            { $limit: 10 }
        ]
        const comments = await Comment.aggregate(commentSearch)
        console.log(comments)
        res.status(200).json({posts, comments})
    } catch (error) {
        res.status(404).json({ message: error.message })
    }

}

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

export const deleteComment = async (req, res) => {
    const { _id, commentId } = req.params;

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        return res.status(404).send('No post with that id');
    }

    const originalComment = await PostMessage.findById(_id);

    if(req.userId !== originalComment.creator) return res.json({message: 'Not allowed to do that!'})

    await Comment.findByIdAndRemove(commentId)

    res.json({message: 'Comment deleted successfully'})
}