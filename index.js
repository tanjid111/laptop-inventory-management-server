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

        //Get all inventory
        app.get('/laptop', async (req, res) => {
            const query = {};
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
