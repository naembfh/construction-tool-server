const express = require('express')
const app = express()
const port =process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
var jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId, Admin } = require('mongodb');
const verify = require('jsonwebtoken/verify');


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yuavs.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req,res,next){
  const authHeader=req.headers.authorization;
  if(!authHeader){
    return res.status(403).send('can not access')
  }
  const token=authHeader.split(' ')[1]
  console.log(token)
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded) {
    if(err){
      return res.status(401).send('can not access')
    }
req.decoded=decoded;
next()
  });
}

async function run(){
  try{
    await client.connect();
    const productCollection=client.db('construction_tools').collection('products');
    const orderCollection=client.db('construction_tools').collection('orders');
    const reviewCollection=client.db('construction_tools').collection('reviews');
    const userCollection=client.db('construction_tools').collection('users');

// products

    app.get('/product',async(req,res)=>{
        const query={}
        const cursor=productCollection.find(query);
        const products=await cursor.toArray()
        res.send(products)
    })
app.post('/product',async(req,res)=>{
  const product =req.body;
  const result=await productCollection.insertOne(product);
  res.send(result)
})
    app.get('/product/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const product=await productCollection.findOne(query);
        res.send(product);
    })

    // orders

app.post('/orders',async(req,res)=>{
    const newOrder=req.body;
    const result=await orderCollection.insertOne(newOrder);
    res.send(result);
})

app.get('/orders',async(req,res)=>{
const email=req.query;
// console.log(email)
const myItem=await orderCollection.find(email).toArray()
res.send(myItem)
})
// reviews
app.post('/reviews',async(req,res)=>{
  const newReview=req.body;
  const review=await reviewCollection.insertOne(newReview);
  res.send(review)
})
app.get('/reviews',async(req,res)=>{
  const result=await reviewCollection.find().toArray()
  res.send(result)
})
// make Admin

app.get('/admin/:email',async(req,res)=>{
  const email=req.params.email;
  const user=await userCollection.findOne({email:email});
  const isAdmin=user?.role==='admin';
  res.send({admin:isAdmin})
})

app.put('/user/:email',async(req,res)=>{
  const email=req.params.email;
  const user=req.body;
  const filter={email:email};
  const options = { upsert: true };
  const updateDoc = {
    $set: user,
  };
  const result=await userCollection.updateOne(filter,updateDoc,options);
  const token=jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '1h' })
  // console.log(token)
  res.send({result,token});

})
app.put('/user/admin/:email', verifyJWT, async (req, res) => {
  const email = req.params.email;
  const requester = req.decoded.email;
  // console.log(requester)
  const requesterAccount = await userCollection.findOne({ email: requester });
  // console.log(requesterAccount)
  if (requesterAccount.role === 'admin') {
    const filter = { email: email };
    const updateDoc = {
      $set: { role: 'admin' },
    };
    const result = await userCollection.updateOne(filter, updateDoc);
    res.send(result);
  }
  else{
    res.status(403).send({message: 'forbidden'});
  }

})


app.get('/user',async(req,res)=>{
  const users=await userCollection.find().toArray()
  res.send(users)
})
  }  
  finally{

  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Manufacturer app listening on port ${port}`)
})