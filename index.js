const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();



//middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.40i2n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const inventory = client.db('laptopInventory').collection('laptop');

        // Get all inventory
        app.get('/laptop', async (req, res) => {
            const query = {};
            const cursor = inventory.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops)
        })

        //Get email query
        app.get('/laptop1', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = inventory.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops)
        })

        //Get single inventory
        app.get('/laptop/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const laptop = await inventory.findOne(query);
            res.send(laptop)
        })

        //Post inventory
        app.post('/laptop', async (req, res) => {
            const newInventory = req.body;
            const result = await inventory.insertOne(newInventory);
            res.send(result);
        })

        //Delete API
        app.delete('/laptop/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventory.deleteOne(query);
            res.send(result);
        })

        //update Inventory
        app.put('/laptop/:id', async (req, res) => {
            const id = req.params.id;
            const updatedInventory = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedInventory.quantity,
                    sold: updatedInventory.sold,
                }
            }
            const result = await inventory.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Laptop Inventory Server')
})

app.listen(port, () => {
    console.log('Listening to port', port);
})
