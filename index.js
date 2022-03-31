const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const expressFileUpload = require('express-fileupload')
const ObjectId = require('mongodb').ObjectID;

const app = express()

const MongoClient = require('mongodb').MongoClient;

const uri = "mongodb+srv://Akash_Hossain:akash044@cluster0.ieei5.mongodb.net/foodDB?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(function (req, res, next) { 
   res.header('Access-Control-Allow-Origin', "*");
   res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
   res.header('Access-Control-Allow-Headers', 'Content-Type');
   next();
})

app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
app.use(expressFileUpload());



app.get('/', (req, res) => {
   res.send('working'); 
}) 
 
client.connect(err => {
   
   const foodItemCollection = client.db("foodDB").collection("foodItem");
   const adminCollection = client.db("foodDB").collection("admins");
   const imageCollection = client.db("foodDB").collection("galleryImage");
   console.log("successfully connected")


   // 
   app.post('/login', (req, res) => {
      // console.log(req)
      adminCollection.find({ email: req.body.email, password: req.body.password })
         .toArray((err, documents) => {
            res.send(documents.length > 0);
         })

   }) 

   // 
   app.post('/addAdmin', (req, res) => {
      adminCollection.insertOne(req.body)
         .then(result => {
            res.send(result.insertedCount > 0);
            // console.log(result)

         })
   })



   //start get all foodItem, add food items, update food items and delete food item part
   app.get('/allFoodItems', (req, res) => {
      foodItemCollection.find({})
         .toArray((err, documents) => {
            res.send(documents);
         })
   })

   app.get('/item/:id', (req, res) => {
      foodItemCollection.find({ _id: ObjectId(req.params.id) })
         .toArray((err, documents) => {
            res.send(documents[0]);
         })
   })

   // insert element in mongodb
   app.post('/addFoodItem', async (req, res) => {

      //  console.log(req)
      const file = req.files.file.data;
      // console.log(file)
      const price = req.body.price;
      const name = req.body.name;
      const description = req.body.description;
      // // console.log(price, description, file)
      var newImage = file.toString('base64');

      const image = {
         contentType: req.files.file.mimetype,
         size: req.files.file.size,
         img: Buffer.from(newImage, 'base64')
      }
      // console.log(image)
      const foodInfo = {
         price: price,
         name: name,
         description: description,
         image
      }
      await foodItemCollection.insertOne(foodInfo)
         .then(result => {
            res.send(result.insertedCount > 0);
            // console.log(result)

         })
   })

   app.patch('/update/:id', (req, res) => {
      // console.log(req.body)
      const file = req.files.file.data;
      const price = req.body.price;
      const name = req.body.name;
      const description = req.body.description;
      var newImage = file.toString('base64');

      const image = {
         contentType: req.files.file.mimetype,
         size: req.files.file.size,
         img: Buffer.from(newImage, 'base64')
      }
      console.log(image)
      const foodInfo = {
         price: price,
         name: name,
         description: description,
         image
      }

      foodItemCollection.updateOne({ _id: ObjectId(req.params.id) },
         {
            $set: { ...foodInfo }
         })
         .then(result => {
            // console.log(result)

            res.send(result.modifiedCount > 0)
         })
   })

   //  delete an item
   app.delete('/delete/:id', (req, res) => {
      // console.log(req.params.id)
      foodItemCollection.deleteOne({ _id: ObjectId(req.params.id) })
         .then(result => {
            res.send(result.deletedCount > 0);
         })
   })

   //end get all foodItem, add food items, update food items and delete food item part






   // start add image, delete image and get images part
   app.post('/addGalleryImage', async (req, res) => {

      //  console.log(req)
      const file = req.files.file.data;
      var newImage = file.toString('base64');

      const image = {
         contentType: req.files.file.mimetype,
         size: req.files.file.size,
         img: Buffer.from(newImage, 'base64')
      }
      console.log(image)

      await imageCollection.insertOne(image)
         .then(result => {
            res.send(result.insertedCount > 0);
            // console.log(result)

         })
   })

   app.get('/allGalleryImages', (req, res) => {
   
      imageCollection.find({})

         .toArray((err, documents) => {
            console.log(documents)
            res.send(documents);
         })
   })
    
   app.delete('/deleteImage/:id', (req, res) => {
      // console.log(req.params.id)
      imageCollection.deleteOne({ _id: ObjectId(req.params.id) })
         .then(result => {
            res.send(result.deletedCount > 0);
         })
   })
 // end add image, delete image and get images part


}); 


app.listen(process.env.PORT || 8080, () => console.log('Listening to port 8080'));
