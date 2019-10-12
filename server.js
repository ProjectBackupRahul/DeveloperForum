const express = require ('express')
 // @ Importing mongoDB connection module
const connetDB = require ('./config/db') 

 const app = express();

 connetDB(); 

 //  @ Init Middleware 

 app.use(express.json({extended: false}))

 app.get('/', (req,res) => res.send('API running'));

 // @ Define all the routes 

 app.use('/api/users' , require('./routes/api/users'));
 app.use('/api/auth' ,  require('./routes/api/auth'));
 app.use('/api/post' , require('./routes/api/post'));
 app.use('/api/profile' ,require('./routes/api/profile'));

 const PORT = process.env.PORT || 5000;
 app.listen(PORT , () => console.log(`Server Started on port ${PORT}`))
