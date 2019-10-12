
const express = require ('express');
const router = express.Router();
// @ Importing Middleware
const auth = require ('../../middleware/auth')
// @ Importing the Profile Model 
const Profile = require('../../models/Profile')
// @ Importing the User Model 
const User = require('../../models/User')
// @ importing express validator for user input 
const { check , validationResult } = require ('express-validator');

// @ route  GET  api//profile/me
// @ Desc   get current users profile 
// @ Access PUBLIC 

router.get('/me', auth, async (req,res) => {
   // res.send ('Profile test route')
    try {
         const profile = await Profile.findOne({user: req.user.id}).populate('user',
         ['nmae', 'avatar']);
         if (!profile){
          return res.status(400).json({msg:'There is no profile for this user '})
         }
          res.json(profile);
    }
    catch(err){
       console.error(err.message);
       res.status(500).send('Server Error')
    }
});

// @ route  POST  api//profile
// @ Desc   Create or update user profile 
// @ Access PRIVATE  


   router.post('/', [auth, 
    [check('status', 'Status is required ').not().isEmpty(),
    check('skill' , 'Skill is required ').not().isEmpty()
]], async(req,res) => {
         const errors = validationResult(req);
         if(!errors.isEmpty()) {
             return res.status(400).json({errors: errors.array()})
         }

         const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin
          } = req.body;
      
          // Build profile object
          const profileFields = {};
          profileFields.user = req.user.id;
          if (company) profileFields.company = company;
          if (website) profileFields.website = website;
          if (location) profileFields.location = location;
          if (bio) profileFields.bio = bio;
          if (status) profileFields.status = status;
          if (githubusername) profileFields.githubusername = githubusername;
          if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim());
          }
           console.log(profileFields.skills);
          // Build social object
          profileFields.social = {};
          if (youtube) profileFields.social.youtube = youtube;
          if (twitter) profileFields.social.twitter = twitter;
          if (facebook) profileFields.social.facebook = facebook;
          if (linkedin) profileFields.social.linkedin = linkedin;
          if (instagram) profileFields.social.instagram = instagram;
      
          try {
            // Using upsert option (creates new doc if no match is found):
            let profile = await Profile.findOne({user: req.user.id});
            if (profile){
                  profile = await Profile.findOneAndUpdate(
                      {user: req.user.id},
                      { $set: profileFields },
                      { new: true, upsert: true });
                      res.json(profile);
            }
          
       /// Create new for users
         profile = new Profile(profileFields);
         await profile.save();
         res.json(profile);
          } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
          }
   });
   
// @ route  GET  api//profile
// @ Desc   Getting all profile 
// @ Access PUBLIC

router.get('/',async(req,res) =>{
   try {
      const profiles = await Profile.find().populate('user', ['name', 'avater'])
       res.json(profiles);
     
   } catch (err) {
       console.error (err.message);
       res.status(500).send('Server Error')

   }
});

 // @ route  GET  api//profile/user/user_id
// @ Desc   Get profile by user ID
// @ Access PUBLIC

router.get('/user/:user_id',async(req,res) =>{
  try {
     const profiles = await Profile.findOne({user: req.params.user_id}).
     populate('user', ['name', 'avater'])
      if (!profile) return res.status(400).json({msg: 'Profile not found'});
      res.json(profiles);
    
  } catch (err) {
      console.error (err.message);
      if (err.kind == 'ObjectId')
      res.status(400).json({msg: 'Profile not found'});
      res.status(500).send('Server Error')

  }
});


module.exports = router;