const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const router = express.Router();
const sql = require('./database/connection');



//Route files require
const homeRoute = require('./routes/home');


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : false}));    //might be removed

//Parse incoming request bodies in a middleware before your handlers, available under the req.body property.
app.use(bodyParser.json({limit:'1mb'}));
app.use(bodyParser.urlencoded({extended: false}));

//logging the HTTPS requests
app.use(logger('dev'));

//to avoid CORS failure from chrome
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token, Authorization, Page, URL');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');
    next();
};

app.use(allowCrossDomain);


//list of the routes
app.use('/',homeRoute(router,sql));

module.exports = app;