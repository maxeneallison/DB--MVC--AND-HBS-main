// Install Command:
// npm init
// npm i express express-handlebars body-parser mongodb


/*Imports */
const express = require("express");           // Create server
const path = require("path");                 // file path 
const bodyParser = require("body-parser");    // parsing request bodies
const { MongoClient } = require("mongodb");   // connecting to MongoDB
const exphbs = require("express-handlebars"); // rendering views
const fs = require("fs");                     //file operations

const app = express(); 
const PORT = 3000; 

const rawData = fs.readFileSync("src/models/Restaurant.json"); //JSON data from file
const resto = JSON.parse(rawData); 

const rawData2 = fs.readFileSync("src/models/user.json"); //JSON data from file
const users = JSON.parse(rawData2); 

const rawData3 = fs.readFileSync("src/models/feedback.json"); //JSON data from file
const feedbacks = JSON.parse(rawData3); 

const rawData4 = fs.readFileSync("src/models/comment.json");
const rawComments = JSON.parse(rawData4);

const uri = "mongodb://127.0.0.1:27017/eggyDB";

const hbs = exphbs.create({ 
    extname: '.hbs', //extension
    layoutsDir: path.join(__dirname, 'src', 'views', 'layouts'),     // layouts directory path
    partialsDir: [path.join(__dirname, 'src', 'views', 'partials')] // partials directory path
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs'); 
app.set('views', path.join(__dirname, 'src', 'views'));             // views directory path

app.use(express.static('public'));                                  // 'public' directory

/*Import Controller */
const restaurantController = require("./src/controllers/restaurantController"); 
restaurantController(app, users); // Routes

/*Connect MongoDB */
MongoClient.connect(uri) 
    .then((client) => { 
        console.log("Connected to MongoDB"); 
        const db = client.db(); 

        app.get("/delete-database", function (req, res) { 
            db.dropDatabase() 
                .then((result) => { 
                    console.log("Database deleted successfully"); 
                    res.send("Database deleted successfully"); 
                })
                .catch((err) => { // Handle deletion error
                    console.error("Error deleting database:", err); 
                    res.status(500).send("Error deleting database");
                });
        });

        db.collection("restaurants") // Access the db collection
            .insertMany(resto) 
            .then((result) => { 
                console.log(`${result.insertedCount} new resto inserted`);
                app.listen(PORT, () => { // Start the server
                    console.log(`Server is running on port ${PORT}`); 
                });
            })
            .catch((err) => { // Handle insertion error
                console.error("Error inserting RESTO into the database:", err);
                client.close(); // Close MongoDB connection
            });

        db.collection("users") // Access the db collection
            .insertMany(users) 
            .then((result) => { 
                console.log(`${result.insertedCount} new users inserted`);
            })
            .catch((err) => { // Handle insertion error
                console.error("Error inserting USERS into the database:", err);
                client.close(); // Close MongoDB connection
            });    

        db.collection("comments") // Access the db collection
        .insertMany(rawComments) 
        .then((result) => { 
            console.log(`${result.insertedCount} new comments inserted`);

        })
        .catch((err) => { // Handle insertion error
            console.error("Error inserting RESTO into the database:", err);
            client.close(); // Close MongoDB connection
        });

        
    })
    .catch((err) => { 
        console.error("Error connecting to MongoDB:", err); 
    });
