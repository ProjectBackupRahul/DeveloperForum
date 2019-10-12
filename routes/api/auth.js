
const express = require ('express');
const router = express.Router();
const auth = require('../../middleware/auth');
// @ importing express validator for user input 
const { check , validationResult } = require ('express-validator');
//  @ Importing User model
const User = require('../../models/User');
// @ Implementing bcrypt for password encription
const bcrypt = require ('bcryptjs')
// @ Importing default json for jwt screct token 
const config =  require('config');

// @ Implementing JWT (Json Web Token)
const jwt = require ('jsonwebtoken');

// @ route  GET  api//auth
// @ Desc   Test route 
// @ Access PUBLIC 
router.get('/', auth,async (req,res) => 
{
try {
      const user =  await User.findById(req.user.id).select('-password'); 
      res.json(user)
    }
 catch(err){
      console.error (err.message) ;
      res.status(500).send('Server Error');
 }
});


// @ route  POST  api//auth
// @ Desc   Authenticate user and get token
// @ Access PUBLIC 

router.post('/', [
          //  Validation for user details 
    check('email', 'Please valid email').isEmail(),
    check('password', 'password is required').exists()
   ], async(req,res) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()){
            return res.status(400).json({errors: errors.array() });
       } 
   
       //@ User Registration with condition duplicate username & email.
        const {email,password} = req.body;
        try{
            let user = await User.findOne({email});
             if(!user){
                  return res.status(400).json({errors: [{msg: ' Invalid Credentials'}]});
             }
        //@ Password compair

        const isMatch = await bcrypt.compare(password,user.password)
        if (!isMatch){
             return res.status(400)
             .json({errors: [{msg: 'Invalid Credentials'}]});
        }
        
       const payload = {
            user: {
                 id : user.id
            }
       }
       jwt.sign(payload, config.get('jwtToken')
       , {expiresIn:360000},
         (err, token)=>{
             if (err) throw err;
             res.json({token})
         });
        
       //res.send ('User Registered !')
   
        }
         catch(err){
           console.error(err.message); 
           res.status(500).send('Server Error');
         }
   });

module.exports = router;