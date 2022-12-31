const express = require('express')
const cors = require('cors')
require("./db/config")
const User = require('./db/User')
const User1 = require('./db/User1')
const Product = require('./db/Product')
const Jwt = require('jsonwebtoken')
const jwtKey = 'server';
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express();

app.use(express.json());
app.use(cors())

app.post("/register", async (req, res) => {
    let user = new User(req.body);
    let result = await user.save()
    result = result.toObject();
    delete result.password
    Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err, token)=>{
        if(err){
            res.send({result: "something went wrong"})
        }
        res.send({result,auth:token})
    })
})

app.post("/registeruser", async (req, res) => {
    console.log(req.body,"llll");
    let user1 = new User1(req.body);
    console.log(req.body,"llll");
    let result = await user1.save()
    result = result.toObject();
    delete result.password
    Jwt.sign({result},jwtKey,{expiresIn:"2h"},(err, token)=>{
        if(err){
            res.send({result: "something went wrong"})
        }
        res.send({result,auth:token})
    })
})


app.post('/login', async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User.findOne(req.body).select('-password')
        if (user) {
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err, token)=>{
                if(err){
                    res.send({result: "something went wrong"})
                }
                res.send({user,auth:token})
            })
            
        } else {
            res.send({result: "no user found"})
        }
    } else {
        res.send({result: "no user found"})
    }
})

app.post('/loggin', async (req, res) => {
    if (req.body.password && req.body.email) {
        let user = await User1.findOne(req.body).select('-password')
        if (user) {
            Jwt.sign({user},jwtKey,{expiresIn:"2h"},(err, token)=>{
                if(err){
                    res.send({result: "something went wrong"})
                }
                res.send({user,auth:token})
            })
            
        } else {
            res.send({result: "no user found"})
        }
    } else {
        res.send({result: "no user found"})
    }
})



app.post('/add-product',verifyToken,async(req,res)=>{
    let product = new Product(req.body)
    let result = await product.save()
    res.send(result)
})

app.post('/add-user',verifyToken,async(req,res)=>{
    let user = new User1(req.body)
    let result = await user.save()
    res.send(result)
})

app.get('/products',verifyToken,async(req,res)=>{
    const products= await Product.find();
    if(products.length>0){
        res.send(products)
    }else{
        res.send({result:"no products aailable"})
    }
})

app.get('/users',verifyToken,async(req,res)=>{
    const users= await User1.find();
    if(users.length>0){
        res.send(users)
    }else{
        res.send({result:"no users aailable"})
    }
})

app.delete('/product/:id',verifyToken,async(req,res)=>{
    let result= await Product.deleteOne({_id:req.params.id});
    res.send(result)
})
app.delete('/user/:id',verifyToken,async(req,res)=>{
    let result= await User1.deleteOne({_id:req.params.id});
    res.send(result)
})



app.get('/product/:id',verifyToken,async(req,res)=>{
    let result = await Product.findOne({_id:req.params.id})
    if(result){
        res.send(result)
    }else{
        res.send({"result":"not found err"})
    }
})

app.get('/user/:id',verifyToken,async(req,res)=>{
    let result = await User1.findOne({_id:req.params.id})
    if(result){
        res.send(result)
    }else{
        res.send({"result":"not found err"})
    }
})

app.put('/product/:id',verifyToken,async(req,res)=>{
    let result= await Product.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    res.send(result)
})

app.put('/user/:id',verifyToken,async(req,res)=>{
    let result= await User1.updateOne(
        {_id:req.params.id},
        {$set:req.body}
    )
    res.send(result)
})


app.get('/search/:key',verifyToken,async(req,res)=>{
    let result = await Product.find({
        "$or":[
            {
                name:{$regex:req.params.key}
            },
            {
                company:{$regex:req.params.key}
            },
            {
                category:{$regex:req.params.key}
            }
        ]
    })
    res.send(result)
})

app.get('/search1/:key',verifyToken,async(req,res)=>{
    let result = await User1.find({
        "$or":[
            {
                name:{$regex:req.params.key}
            },
            {
                email:{$regex:req.params.key}
            },
            {
                password:{$regex:req.params.key}
            }
        ]
    })
    res.send(result)
})


app.get("/single-User-Data/:id",verifyToken,async(req,res)=>{
    const userData = await User.find({ _id: req.params.id });
    if (userData) {
      res.send(userData);
    } else {
      res.send({ result: "No user Found" });
    }
  })

  app.get("/single-User-Data1/:id",verifyToken,async(req,res)=>{
    const userData = await User1.find({ _id: req.params.id });
    if (userData) {
      res.send(userData);
    } else {
      res.send({ result: "No user Found" });
    }
  })

//   app.post('/updateImage',(req,res)=>{

//   })


function verifyToken(req,res,next){
    console.warn(req.headers['authorization']);
    let token = req.headers['authorization'];
    if(token){
         token = token.split(' ')[1]
         Jwt.verify(token, jwtKey, (err, valid)=>{
            if(err){
                res.send("please provide a valid token")
            }else{
                next()
            }
         })
    }else{
        res.send("please provide a token")
    }
    
}

app.listen(5000);
