const express = require('express')
const app = express()
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

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

const userCollection = client.db('Car-Service').collection('CarUser');
const serviceCollection = client.db('Car-Service').collection('Service');
const bookedCollection = client.db('Car-Service').collection('Booking');

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
    }
  }
  const service = await serviceCollection.findOne(query, options);
  res.send(service);
});

app.post("/checkout", async(req, res) =>{
  const bookedService = req.body;
  console.log(bookedService);
  const result = await bookedCollection.insertOne(bookedService);
  res.send(result);

})


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})