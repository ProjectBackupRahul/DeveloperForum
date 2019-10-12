
const express = require ('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require ('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');


// @ route  POST  api//post
// @ Desc   Create a post of a user 
// @ Access PRIVATE

router.post('/', [auth,[
  check ('text', 'text is required').not().isEmpty()

]],async(req,res) =>{
  const errors = validationResult(req);
   if (!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array()})
   }
   try {
    const user = await User.findById(req.user.id).select('-password');
    const newPost =new Post ({
         text: req.body.text,
         name : user.name,
         avater: user.avater,
         user: req.user.id,
    });
      const post = await newPost.save();
      res.json(post);
       
   } catch (err) {
       console.error(err.message);
       res.status(500).send('Server Error')
   }  
});

 
// @ route  POST  api//post
// @ Desc    Get all the posts 
// @ Access PRIVATE
router.get('/', auth, async(req,res)=>{
try {
     const posts = await Post.find().sort({date: -1});
     res.json(posts)
} catch (err) {
     console.error(err.meease);
     res.status(500).send('Server Error')
}
})

// @ route  POST  api//post/:id
// @ Desc    Get post by ID
// @ Access PRIVATE
router.get('/:id', auth, async(req,res)=>{
    try {
         const post = await Post.findById(req.params.id);
         if (!post){
              return res.status(404).json({msg: 'Post not found'})
         }
         res.json(post)
    } catch (err) {
        if (err.kind == 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'})
       }
         console.error(err.meease);
         res.status(500).send('Server Error')
    }
    })
    
// @ route  DELETE  api//post/:id
// @ Desc   Delete a post 
// @ Access PRIVATE
router.get('/', auth, async(req,res)=>{
    try {
         const posts = await Post.findById(req.params.id);
         if (!post){
            return res.status(404).json({msg: 'Post not found'})
       }
         // check on user post 
         if (post.user.toString() !== req.user.id){
             
              return res.status(401).json({msg: 'User not authorized'});
         }
           await post.remove()
         res.json({msg : 'post removed'})
    } catch (err) {
         console.error(err.meease);
         if (err.kind == 'ObjectId'){
            return res.status(404).json({msg: 'Post not found'})
       }
         res.status(500).send('Server Error')
    }
    })
module.exports = router;

 //  Start from POST API Routes 