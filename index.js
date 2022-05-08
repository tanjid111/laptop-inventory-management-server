const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();



//middleware
app.use(cors())
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'Unauthorized Access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.40i2n.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect();
        const inventory = client.db('laptopInventory').collection('laptop');

        //Auth
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // Get all inventory
        app.get('/laptop', async (req, res) => {
            const query = {};
            const cursor = inventory.find(query);
            const laptops = await cursor.toArray();
            res.send(laptops)
        })

        //Get email query
        app.get('/laptop1', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = inventory.find(query);
                const laptops = await cursor.toArray();
                res.send(laptops)
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' })
            }
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
