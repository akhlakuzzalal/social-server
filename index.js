const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId
const cli = require('nodemon/lib/cli');
require('dotenv').config();

const port = process.env.PORT || 2000;

const app = express();
app.use(cors());
app.use(express.json());


// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rolps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

async function run() {
   try {
      await client.connect();
      console.log("connected to MongoDB");

      const database = client.db('SocialData');
      const userData = database.collection('user');
      const postsCollection = database.collection('post');

      // Create User 
      app.put('/user', async (req, res) => {
         const data = req.body;
         const filter = { email: data.email };
         const option = { upsert: true };
         console.log("hitted", data)
         if (data.aboutMe) {
            const updateDoc = {
               $set: {
                  aboutMe: data.aboutMe,
                  birthday: data.birthday,
                  occupation: data.occupation
               }
            }
            const result = await userData.updateOne(filter, updateDoc, option);
            res.json(result);
         }
         else {
            const updateDoc = {
               $set: data
            }
            const result = await userData.updateOne(filter, updateDoc, option);
            res.json(result);
         }

      })

      // Get users
      app.get('/user/:email', async (req, res) => {
         const email = req.params.email
         const query = { email: email }
         const result = await userData.findOne(query);
         res.json(result);
      })

      // Creare Post
      app.post('/newpost', async (req, res) => {
         const post = req.body;
         console.log("hitted", post)
         const result = await postsCollection.insertOne(post)
         res.json(result);
      });

      // get Post
      app.get('/posts', async (req, res) => {
         const query = {}
         const cursor = postsCollection.find(query);
         const result = await cursor.toArray()
         res.json(result);
      })
      app.get('/userposts/:email', async (req, res) => {
         const email = req.params.email
         const query = { email: email }
         const cursor = postsCollection.find(query);
         const result = await cursor.toArray()
         res.json(result);
      });

      // delete post
      app.delete('/posts/:id', async (req, res) => {
         const id = req.params.id;
         const query = { _id: ObjectId(id) }
         const result = await postsCollection.deleteOne(query);
         res.json(result);
      })
   }
   finally {

   }
}
run().catch(console.dir);


app.get('/', (req, res) => {
   res.send('Running Social Server');
})

app.listen(port, () => console.log('running on', port))