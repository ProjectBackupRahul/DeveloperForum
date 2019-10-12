
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
// @ Implementing request 
const request = require('request');
// @ Implementing request 
const config = require('config');

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
       //  get user detail of user profile

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

// @ route  DELETE  api//profile
// @ Desc   Get profile by user ID
// @ Access Private

   // delete user profile 

router.delete('/',auth,async(req,res) =>{
  try {
    // Remove user post 
    // Remove profiles

     await Profile.findOneAndRemove({user: req.user.id});
     await User.findOneAndRemove({_id: req.user.id});
      res.json({msg: 'User Delet ed'});
    
  } catch (err) {
      console.error (err.message);
      res.status(500).send('Server Error')
  }
});

// @ route  PUT  api//profile/edcation 
// @ Desc    Add profile experience 
// @ Access Private

router.put('/experience',[auth,[
check('title', 'Title is required ').not().isEmpty(),
check('company', 'Company is required ').not().isEmpty(),
check('from', 'From date is required ').not().isEmpty(),
]],async(req,res) =>{
    const errors = validationResult(req);
    if (errors.isEmpty()){
       return res.status(400).json({errors:errors.array()});
    }   
     const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
     } = req.body
       const newExp ={
          title, 
          company,
          location,
          from,
          to,
          current,
          description
       }
        try {
           const profile = await Profile.findOne({user: req.user.id});
           profile.experience.unshift(newExp);
           await profile.save();
           res.json(profile);
        }
        catch(err){
          console.error(err.message);
          res.status(500).send('Server Error');           
        }
});
// @ route  PUT  api//profile/experience/:exp_id
// @ Desc    Delete experience from profile 
// @ Access Private

   router.delete('/experience/:exp_id', auth , async(req, res)=> {
         try {
          const profile = await Profile.findOne({user: req.user.id});

          // Get remove index 
           const removeIndex = profile.experience.map(item => item.id)
           .indexOf(req.params.exp_id);
           profile.experience.splice(removeIndex,1)
           await profile.save();
           res.json(profile)
         } catch (error) {
          console.error(err.message);
          res.status(500).send('Server Error'); 
         }
   });

// @ route  PUT  api//profile/education
// @ Desc    Add profile experience 
// @ Access Private

router.put('/education',[auth,[
  check('school', 'School is required ').not().isEmpty(),
  check('degree', 'Degree is required ').not().isEmpty(),
  check('study', 'Study is required ').not().isEmpty(),
  check('from', 'From date is required ').not().isEmpty(),
  ]],async(req,res) =>{
      const errors = validationResult(req);
      if (errors.isEmpty()){
         return res.status(400).json({errors:errors.array()});
      }   
       const {
          school,
          degree,
          study,
          from,
          to,
          current,
          description
       } = req.body
         const newEdu ={
            school,
            degree,
            study,
            from,
            to,
            current,
            description
         }
          try {
             const profile = await Profile.findOne({user: req.user.id});
             profile.education.unshift(newEdu);
             await profile.save();
             res.json(profile);
          }
          catch(err){
            console.error(err.message);
            res.status(500).send('Server Error');           
          }
  });
  // @ route  PUT  api//profile/education/:edu_id
  // @ Desc    Delete education from profile 
  // @ Access Private
  
     router.delete('/edcation/:edu_id', auth , async(req, res)=> {
           try {
            const profile = await Profile.findOne({user: req.user.id});
  
            // Get remove index 
             const removeIndex = profile.education.map(item => item.id)
             .indexOf(req.params.edu_id);
             profile.education.splice(removeIndex,1)
             await profile.save();
             res.json(profile)
           } catch (error) {
            console.error(err.message);
            res.status(500).send('Server Error'); 
           }
     });

  // @ route  GET  api//profile/github/:username
  // @ Desc   get user repo from github
  // @ Access  PUBLIC

  router.get('/github/:username', (req,res) =>{
    try {
         const options ={
            uri: `https://api.github.com/users/${req.params.usernmae}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secrect=${config.get('githubSecret')}}`,
             method: 'GET',
             headers: {'user-egent': 'node.js'}
             
         };
           request(options,(error,responce,body ) =>{
              if (error)
              console.error(error)
              if (responce.statusCode !== 200) {
              return res.status(404).json({msg: "No github profile found"})

              }
               res.json(JSON.parse(body));
           });
    } catch (err) {
       console.error(err.message);
       res.status(500).send('Server error');
    }
  })


module.exports = router;