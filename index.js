const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6ded.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('icons'));
app.use(fileUpload());


const port = 5000;


const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});
client.connect(err => {
    const adminCollection = client.db("CreativeAgency").collection("admin");
    const ordersCollection = client.db("CreativeAgency").collection("orders");
    const servicesCollection = client.db("CreativeAgency").collection("services");
    const reviewsCollection = client.db("CreativeAgency").collection("reviews");
    const messagesCollection = client.db("CreativeAgency").collection("messages");


    app.post("/addAdmin", (req, res) => {
        const admin = req.body;
        console.log(admin);
        adminCollection.insertOne(admin)
        .then(result => {
            console.log(result);
            res.status(200).send(result)
        })
    })

    app.post('/adminAccess', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
        .toArray((err, result) => {
            res.send(result.length > 0);
        })
    })

    // app.post("/placeOrder", (req, res) => {
    //     const order = req.body;
    //     console.log(order);
    //     ordersCollection.insertOne(order)
    //     .then(result => {
    //         console.log(result);
    //         res.status(200).send(result)
    //     })
    // })

    app.post("/placeOrder", (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const projectName = req.body.projectName;
        const projectDetails = req.body.projectDetails;
        const price = req.body.price;
        const status = req.body.status;
        
        // console.log(name, email, projectName, projectDetails, price, file, status);
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        ordersCollection.insertOne({name, email, projectName, projectDetails, price, image, status})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.post("/addService", (req, res) => {
        const file = req.files.file;
        const title = req.body.title;
        const description = req.body.description;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        const image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        servicesCollection.insertOne({title, description, image})
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/services', (req, res) => {
    servicesCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.get('/usersOrder', (req, res) => {
    const email = req.query.email;
    ordersCollection.find({ email: email })
        .toArray((err, documents) => {
            if(documents.length > 0){
                res.status(200).send(documents);
            }            
        })
    })

    app.post("/addReview", (req, res) => {
        const review = req.body;
        console.log(review);
        reviewsCollection.insertOne(review)
        .then(result => {
            res.status(200).send(result)
        })
    })

    app.get('/review', (req, res) => {
    reviewsCollection.find({}).sort({_id: -1}).limit(3)
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.get('/allOrders', (req, res) => {
    ordersCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    });

    app.post("/addMessage", (req, res) => {
        const message = req.body;
        messagesCollection.insertOne(message)
        .then(result => {
            res.status(200).send(result)
        })
    })


});



app.get('/', (req, res) => {
    res.send("doctorsPortal's backend")
})

app.listen(process.env.PORT || port)