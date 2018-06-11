const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const { Post } = require('../models')
const { authMiddleware } = require('../lib/auth')

router.get('/', async (req,res) => {
    const posts = await Post.find()
    res.json(posts)
 })
 
 
 router.get('/:postID',async (req,res) =>{
   const postId = req.params.postID  
   try{
     const post = await Post.findById(postId)
     if(!post){
         return res.sendStatus(404)
     }
     res.json(post)
   } catch (err){
       if(err instanceof mongoose.CastError){
           return res.sendStatus(404)
       }
   }
    
 })

 //POST /post/create

 router.post('/create', authMiddleware, async (req , res) => {
    if(!req.user){
        return res.sendStatus(401)
    } 

    try{
        const {title,tags,content} = req.body
        const authorId = req.user._id
        
        const post = await Post.create({
            title,
            tags,
            content,        
            authorId
        })

        res.json(post)

    } catch (err) {
        console.log(err)
    }
 
 }) 


module.exports = router