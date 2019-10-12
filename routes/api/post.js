
const express = require ('express');
const router = express.Router();


// @ route  GET  api//post
// @ Desc   Test route 
// @ Access PUBLIC 
router.get('/', (req,res) => res.send ('post test route'));

module.exports = router;