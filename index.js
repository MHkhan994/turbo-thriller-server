const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.Db_User}:${process.env.Db_Pass}@cluster0.qmhrwse.mongodb.net/?retryWrites=true&w=majority`;

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

        const toyCollection = client.db('turboThriller').collection('toys')

        // sends all toys by all users
        app.get('/toys', async (req, res) => {
            const result = await toyCollection.find().toArray()
            res.send(result)
        })

        // sends the total length of toys
        app.get('/totalToys', async (req, res) => {
            const result = await toyCollection.estimatedDocumentCount();
            res.send({ totalToys: result })
        })

        // sends data considering limit
        app.get('/toyLimit', async (req, res) => {
            const page = req.query.page
            const skip = (page - 1) * 20
            const result = await toyCollection.find().skip(skip).limit(20).toArray()
            res.send(result)
        })

        // sends data sorting by toy name
        app.get('/toyName', async (req, res) => {
            const name = req.query.name;
            const searchRegex = name.split(' ').map((word) => new RegExp(word, 'i'));
            const result = await toyCollection.find({ $or: searchRegex.map((regex) => ({ name: regex })) }).toArray()
            res.send(result)
        })

        // sends single toy
        app.get('/toyDetails/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.findOne(query)
            res.send(result)
        })

        // sends toys that match user email
        app.get('/myToys/:email', async (req, res) => {
            const email = req.params.email;
            const query = { seller_email: email }
            const result = await toyCollection.find(query).toArray()
            res.send(result)
        })

        // adds a new toy to database
        app.post('/toys', async (req, res) => {
            const toy = req.body
            const result = await toyCollection.insertOne(toy)
            res.send(result)
        })

        // deletes single toy
        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query)
            res.send(result)
        })

        // updates single toy
        app.patch('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const toy = req.body;
            const filter = { _id: new ObjectId(id) }
            const updateToy = {
                $set: {
                    name: toy.name,
                    picture: toy.picture,
                    price: toy.price,
                    quantity: toy.quantity,
                    subcategory: toy.subcategory,
                    description: toy.description,
                }
            }
            const result = await toyCollection.updateOne(filter, updateToy)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
