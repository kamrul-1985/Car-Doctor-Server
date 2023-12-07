const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors')
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


app.use(express.json());
app.use(cors());

// console.log(process.env.SECRET_USER);

// const uri = "mongodb+srv://Car-Service:GHFtYMjD3ijoWei3@cluster0.suysb7o.mongodb.net/?retryWrites=true&w=majority";

const uri = `mongodb+srv://${process.env.SECRET_USER}:${process.env.SECRET_kEY}@cluster0.suysb7o.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const verifyJWT = (req, res, next)=>{
const authorization = req.headers.authorization;
console.log('from verify');
if(!authorization){
  return res.status(401).send({error: true, message:'unauthorized access'});
}
const token = authorization.split(' ')[1]
const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);

jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded)=>{
  if(error){
    return res.status(403).send({error: true, message:'unauthorized access'});
  }
   req.decoded = decoded;
   console.log(decoded);
   next();
});
}


// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

    // copy from youga school server
    const dbConnect = async () => {
      try {
        client.connect();
        console.log("Database Connected Successfully✅");
    
      } catch (error) {
        console.log(error.name, error.message);
      }
    }
    dbConnect();


const userCollection = client.db('Car-Service').collection('CarUser');
const serviceCollection = client.db('Car-Service').collection('Service');
const bookedCollection = client.db('Car-Service').collection('Booking');


app.post('/jwt', async (req, res)=>{
  const user = req.body;
  
  const token = jwt.sign(user, process.env.ACCESS_TOKEN, {expiresIn:'1h'});
  res.send({token})
})

app.post('/users', async(req, res)=>{
  const user = req.body;
  console.log(user);
  const result = await userCollection.insertOne(user);
  res.send(result);
});

app.get("/users", async (req, res) => {
const cursor = userCollection.find();
const result = await cursor.toArray();
res.send(result)
});

app.get("/users/:id", async (req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const user = await userCollection.findOne(query);
  res.send(user)
});

app.get("/services", async (req, res) => {
const cursor = serviceCollection.find();
const result = await cursor.toArray();
res.send(result)
});

app.get("/services/:id", async(req, res) =>{
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const options = {
    projection: {
      title:1,
      service_id: 1,
      price: 1,
      img:1
    }
  }
  const service = await serviceCollection.findOne(query, options);
  res.send(service);
});

app.post("/checkout", async(req, res) => {
  const bookings = req.body
  console.log('this is from booking');
  const result = await bookedCollection.insertOne(bookings);
  res.send(result);
});

// app.use(verifyJWT);

app.get("/bookings", verifyJWT, async(req, res)=>{
  console.log('comeback after verify');
  const decoded = req.decoded;
  if(decoded.email !== req.query.email){
    return res.status(404).send({error: true, message:'unauthorized error'})
  };
  let query = {};
  if(req.query?.email){
    query = {email: req.query.email}
  }
  try {
    const cursor = bookedCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/bookings/:id', async (req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await bookedCollection.deleteOne(query);
      res.send(query)
});


app.patch('/bookings/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateBooking = req.body;

  const updateDoc = {
    $set: {
      status: updateBooking.status,
    },
  };

  const result = await bookedCollection.updateOne(filter, updateDoc);
  res.send(result);

});

// // ***commented because dbConnected function replaced run function


//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})