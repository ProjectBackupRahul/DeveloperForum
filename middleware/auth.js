
  // middleware to access private routs after login

  const jwt = require ('jsonwebtoken');
  const config = require('config');


  module.exports = function(req,res,next) {
      // @ Get the token from the header 
      const token = req.header ('x-auth-token');
      // @ check no token 

      if(!token){
           return res.status(401).json({msg: 'No token , authorization denied'})
      }
       // @ Verify the token and decoding the token 

       try {
            const decoded = jwt.verify(token,config.get('jwtToken'));
            req.user = decoded.user;
            next(); 
       }
        catch(err){
            res.status(401).json({msg:'Token is not found'}) 
        }
  }