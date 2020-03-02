const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Import Routes
const authRoute = require('./routes/auth');
const postRoute = require('./routes/post');
const hesapIslemleriRoute = require('./routes/hesapIslemleri');


dotenv.config()

//Connect to DB
mongoose.connect(process.env.DB_CONNECT, { useNewUrlParser: true },
() => console.log('Connect to db') );

//Middleware
app.use(express.json());

//Route Middleware
app.use('/api/user', authRoute);

app.use('/api/posts', postRoute);

app.use('/api/hesap', hesapIslemleriRoute);



app.listen(3000, ()=> console.log('Sunucu çalışıyor...'));
