const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n0q8wig.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    client.connect();

    // create collections here
    const productsCollection = client.db("furnsDB").collection("products");
    const usersCollection = client.db("furnsDB").collection("users");
    const purchasesCollection = client.db("furnsDB").collection("purchases");

    // users related api
    // get all users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    // get specific user
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    // post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // products related api
    // get all product
    app.get("/products", async (req, res) => {
      const result = await productsCollection.find().toArray();
      res.send(result);
    });

    // get specific product
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // post product
    app.post("/products", async (req, res) => {
      const body = req.body;
      const result = await productsCollection.insertOne(body);
      res.send(result);
    });

    // purchase related api
    // get bookmarked products
    app.get("/purchases/bookmarked", async (req, res) => {
      const email = req.query.email;
      const query = { user_email: email, payment_status: "bookmarked" };
      const result = await purchasesCollection.find(query).toArray();
      res.send(result);
    });

    // get purchased products
    app.get("/purchases/purchased", async (req, res) => {
      const query = { payment_status: "purchased" };
      const result = await purchasesCollection.find(query).toArray();
      res.send(result);
    });

    // get specific purchase product
    app.get("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchasesCollection.findOne(query);
      res.send(result);
    });

    // post purchase
    app.post("/purchases", async (req, res) => {
      const body = req.body;
      const result = await purchasesCollection.insertOne(body);
      res.send(result);
    });

    // update purchase
    app.patch("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const body = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: body,
      };
      const result = await purchasesCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // delete product
    app.delete("/purchases/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await purchasesCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Furns is running");
});

app.listen(port, () => {
  console.log(`Furns is running on port ${port}`);
});
