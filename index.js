const express = require('express')
const app = express()
const port =process.env.PORT || 5000;
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(cors());
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yuavs.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
  try{
    await client.connect();
    const productCollection=client.db('construction_tools').collection('products');
    const orderCollection=client.db('construction_tools').collection('orders');

    app.get('/product',async(req,res)=>{
        const query={}
        const cursor=productCollection.find(query);
        const products=await cursor.toArray()
        res.send(products)
    })

    app.get('/product/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const product=await productCollection.findOne(query);
        res.send(product);
    })
app.post('/orders',async(req,res)=>{
    const newOrder=req.body;
    const result=await orderCollection.insertOne(newOrder);
    res.send(result);
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