const mongoose  = require('mongoose');
const config = require('config');
const db = config.get('mongoURI'); 

//mongoose.connect(db)


// @ Attempt to connect mongoDB atlas with aysnc function
const connectDB = async() =>{ 
     try {
         await mongoose.connect(db ,{
              useNewUrlParser: true , 
              useUnifiedTopology: true ,
              useCreateIndex: true,
              useFindAndModify:false
          });
              console.log("Conected to mongoDB Atlas");  
     }
     catch (err){
            console.error(err.message);
            process.exit(1); // exit process with faliure 
     }
}

 module.exports = connectDB;