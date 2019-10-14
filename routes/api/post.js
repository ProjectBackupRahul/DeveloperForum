
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

router.delete('/', auth, async(req,res)=>{
    try {
         const posts = await Post.findById(req.params.id);
         if (!posts){
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
    });

// @ route  DELETE  api//post/like/:id
// @ Desc   Like a post 
// @ Access PRIVATE
 router.post ('/like/:id', auth ,async(req,res) =>{
    try {
         const post = await Post.findById(req.params.id);
         //  Checking the post has already been liked by this user 
          if (post.likes.filter(like => like.user.toString === req.user.id).length >0){
           return res.status(400).json({mes:'Post already liked'});
          }
           post.likes.unshift({user: req.user.id});
           await post.save();
           res.json(post.likes)
    } catch (err) {
         console.error(err.message);
         res.status(500).send('Server Error'); 
    }
 });

// @ route  DELETE  api//post/unlike/:id
// @ Desc   Unlike a post 
// @ Access PRIVATE

router.post ('/unlike/:id', auth ,async(req,res) =>{
     try {
          const post = await Post.findById(req.params.id);
          //  Checking the post has already been liked by this user 
           if (post.likes.filter(like => like.user.toString === req.user.id).length ===0){
            return res.status(400).json({mes:'Post has not yet been liked'});
           }
          // Get remove index 
          const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
          post.likes.splice(removeIndex,1)
            await post.save();
            res.json(post.likes);
     } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error'); 
     }
  });

// @ route  POST  api//post/comment/:id
// @ Desc   Comment on a post 
// @ Access PRIVATE

router.post('/comment/:id', [auth,[
     check ('text', 'text is required').not().isEmpty()
   ]],async(req,res) =>{
     const errors = validationResult(req);
      if (!errors.isEmpty()){
           return res.status(400).json({ errors: errors.array()})
      }
      try {
       const user = await User.findById(req.user.id).select('-password');
       const post = await Post.findById(req.params.id);
       const newComment = {
            text: req.body.text,
            name : user.name,
            avater: user.avater,
            user: req.user.id,
       };
        post.comments.unshift(newComment);
        await post.save();
         res.json(post.comments);
          
      } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error')
      }  
   });
   

// @ route  DELETE  api/post/comment/:id/:comment_id
// @ Desc   Delete Comment 
// @ Access PRIVATE

  router.delete('/comment/:id/:comment_id', auth, async(req,res) =>{
        try {
          const post = await Post.findById(req.params.id);
          // pull out comment 
          const comment = post.comment.find(comment => comment.id === req.params.comment_id);
          // make sure comment exist 

          if (!comment){
               return res.status(404).json({msg : 'Comment does not exists'})
          }
          //check user 
          if (comment.user.toString() !== req.user.id){
               return res.status(401).json({msg : 'User not authorized'})
          }
          // Get remove index
          const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
          post.comments.splice(removeIndex,1)
            await post.save();
            res.json(post.comment);

        } catch (err) {
             console.error(err.message);
             res.status(500).send('Server Error')
        }
  });
       
module.exports = router;

 //  Start from POST API Routes 