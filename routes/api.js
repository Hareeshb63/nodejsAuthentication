var express = require("express");
var mongoose = require("mongoose");
var url = "mongodb://127.0.0.1:27017/mydatabase";
const jwt= require("jsonwebtoken");

mongoose.connect(url,err=>{
    if(err){
        console.log('Errror!!' + err);
    }else{
        console.log("connect to mongodb")
    }
})

// to server
var router= express.Router();
var User= require("../models/users");


function verifyToken(req,res,next){
    if(!req.headers.authorization){
        return res.status(401).send("Unauthorized Reques")
    }
     let token = req.headers.authorization.split(' ')[1]
     if(token== null){
         return res.status(401).send("Unauthorized Reques")
    }
    let payload= jwt.verify(token,'secretKey') // if present
    if (!payload){
        return res.status(401).send("Unauthorized Reques")
    }
    req.userdb= payload.subject;
    next();
}


router.get("/",function(req,res){
    res.send("hello from api")
});




router.post("/register",(req,res)=>{
    let userData= req.body;             // extract userdata from requst obj
    let userdb= new User(userData);       // convert into model mongoose understand
    userdb.save((err,registeredUser)=>{   //save user data into database
        if(err){
            console.log(err)
        }else{
            let payload= {subject:registeredUser._id}
            let token= jwt.sign(payload,' ')
            res.status(200).send({token});
        }
    })
})

router.post("/login",(req,res)=>{
    let userData= req.body;

    User.findOne({email: userData.email},(err,userdb)=>{
        if(err){
            console.log(err);
        }else{
            if(!userdb){
                res.status(401).send('invalid email');
            }else{
                if(userdb.password !== userData.password){ 
                    res.status(401).send('invalid password');
                }else{
                    let payload= {subject:userdb._id}
                    let token= jwt.sign(payload,'secretKey')
                    res.status(200).send({token})
                }
            }
        }
    })
})

router.get("/employees",verifyToken,(req,res)=>{
    let employees=[
        {
            "id":"11",
            "name":"Abc",
            "designation":"engg"
        },
        {
            "id":"12",
            "name":"asd",
            "designation":"engg"
        },
    ]

    res.json(employees)
})

// Admim Item Upload
router.post("/upload_item",(req,res)=>{
    let userData= req.body;             
    let userdb= new User(userData);       
    userdb.save((err,item_uploaded)=>{   
        if(err){
            console.log(err)
        }else{
          
            res.status(200).send(item_uploaded);
        }
    })
})




module.exports = router; 