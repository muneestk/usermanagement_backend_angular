const express = require('express')

const mongoose = require("mongoose");

const cors = require('cors')

const cookieParser = require('cookie-parser') 

const userRoutes = require('./routes/userRoute')
const adminRoutes = require('./routes/adminRoute')


const app = express()

app.use(cors({
    credentials:true,
    origin:['http://localhost:4200']
}))

app.use(cookieParser())


app.use(express.urlencoded({ extended: true }));
app.use(express.json());



app.use("/",userRoutes)
app.use("/admin",adminRoutes)

app.use('/file', express.static('uploads'));


mongoose.connect("mongodb://127.0.0.1:27017/angularminiprojectweek19", {}).then(() => {
    console.log('Connected to the database');

    app.listen(5000, () => {
        console.log("App is running on port 5000");
    });
}).catch((error) => {
    console.error('Error connecting to the database:', error);
});