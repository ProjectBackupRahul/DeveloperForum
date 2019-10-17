
const express = require ('express');
const router = express.Router();
// @ Implementing gravater package 
const gravater = require('gravatar');
// @ Implementing bcrypt for password encription
const bcrypt = require ('bcryptjs')
// @ Implementing JWT (Json Web Token)
const jwt = require ('jsonwebtoken');
// @ importing express validator for user input 
 const { check , validationResult } = require ('express-validator');
// @ Importing User Model 
 const User = require('../../models/User');
// @ Importing default json for jwt screct token 
const config =  require('config');

// @ route  POST  api//user
// @ Desc   Register user 
// @ Access PUBLIC 

router.post('/', [
 check('name', 'Name is required').not().isEmpty(),        //  Validation for user details 
 check('email', 'Please valid email').isEmail(),
 check('password', 'please enter a password with 6 or more character').isLength({min: 6})
], async(req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
         return res.status(400).json({errors: errors.array() });
    } 

    //@ User Registration with condition duplicate username & email.
     const {name,email,password} = req.body;
     try{
         let user = await User.findOne({email});
          if(user){
               return res.status(400).json({errors: [{msg: 'User already exists'}]});
          }
     //@ Get user gravater and implementing size of the same 
     const avatar = gravater.url(email,{
          s: '200',
          r: 'pg',
          d: 'mm'
     })  
      user = new User ({
          name,
          email, 
          avatar,
          password 
      })
 // @  Encrypting the user password using bcrypt 
     const salt = await bcrypt.genSalt(10);
     user.password = await bcrypt.hash(password, salt);
     await user.save();  

     // Faced issues  : cannot do raw queries on admin in atlas 
     // Solution : By changing the URL admin to custer name 
    
    // @ Return JSON webtoken 
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