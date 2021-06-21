const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const fs =require('fs-extra');
const MongoClient =require('mongodb').MongoClient;
require('dotenv').config()




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fomhs.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



const app = express ()


app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());



const port = 5000 ;
app.get ('/', (req,res) => {
    res.send('hello')
})
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
  const doctorCollection= client.db("doctorsPortal").collection("doctors");

  //post method
 app.post('/addAppointment',(req,res) => {
const appointment = req.body;
console.log(appointment);
appointmentsCollection.insertOne(appointment)
.then(result => {
    res.send(result.insertedCount)
})


 })
 //post end
 //loaded data 
 app.post('/addAppointmentsByDate',(req,res) => {
    const date = req.body;
    console.log(date.date);
    const email = req.body.email;

    doctorCollection.find({email:email})
.toArray((err,doctors) =>{
    const filter = {date: date.date}
   if(document.length === 0 ){
       filter.email = email ;
   }
   appointmentsCollection.find(filter)
   .toArray((err,document) =>{

       res.send(document);
   })
})




})
    //end


    app.post('/addDoctor',(req,res)=>{
const file =req.files.file;
const name = req.body.name;
const email = req.body.email;
console.log(name,email,file);

 const filePath =   `${__dirname}  /doctors/ ${file.name}`;
file.mv( filePath,err => {
    if(err ){
        console.log(err);
        return res.status(500).send({msg: 'Failed to upload image'});

    }
    // return res.send({name:file.name , path:`/${file.name}`});
     const newImg = fs.readFileSync(filePath);
 const encImg = newImg.toString('base64');

 var image ={
     contentType:req.files.file.mimetype,
    size:req.files.file.size,
     img:Buffer.from (encImg,'base64')
 };
 doctorCollection.insertOne({name,email,image})
.then(result =>{
    fs.remove(filePath,error =>{
        if(error) {
            console.log(error)
            res.status(500).send({msg: 'Failed to upload image'});

        }
        res.send(result.insertedCount >0)


    })
})
    // return res.send({name:file.name, path:`/${file.name}`})
})
    })
    
    app.post('/isDoctor',(req,res) => {
        console.log(date.date);
        const email = req.body.email;
    
        doctorCollection.find({email:email})
    .toArray((err,doctors) =>{
        
    res.send(doctors .length > 0);
     
    })
    
    
    
    
    })
    
     

});




//End



app.listen( process.env.PORT ||  port )
