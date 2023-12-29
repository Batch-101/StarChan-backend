require('dotenv').config();
require('./models/connection')

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var usersRouter = require('./routes/users');
var newsRouter = require('./routes/news');
var categoriesRouter = require('./routes/categories');
var subjectsRouter = require('./routes/subjects');
var picturesRouter = require('./routes/pictures');
var weatherRouter = require('./routes/weather');
var galleryRouter = require('./routes/gallery');
var forumRouter = require('./routes/forum');

var app = express();

const cors = require('cors');
app.use(cors());

const fileUpload = require('express-fileupload');
app.use(fileUpload());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/users', usersRouter);
app.use('/news', newsRouter);
app.use('/categories', categoriesRouter);
app.use('/subjects', subjectsRouter);
app.use('/pictures', picturesRouter);
app.use('/weather', weatherRouter);
app.use('/gallery', galleryRouter);
app.use('/forum', forumRouter);


module.exports = app;
