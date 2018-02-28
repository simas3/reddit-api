
require('./config/config');


const _ = require('lodash');
const cors = require('cors');
var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var colors = require('colors');
var { mongoose } = require('./db/mongoose');
var { User } = require('./models/user');
var { Post } = require('./models/post');
var { Vote } = require('./models/vote');
var { Comment } = require('./models/comment');
var { Message } = require('./models/message');
var { ObjectID } = require('mongodb');


var app = express();
var router = express.Router();
const port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(morgan('dev'));                    // logger
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());


router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Expose-Headers', 'X-Total-Count, x-auth, Origin');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-auth");
    //Response type
    res.setHeader("Content-Type", "application/json");

    next();
});




/**
 * Users rest service
 */
require('./rest/user.rest.js')(router, User);
/**
 * Posts rest service
 */
require('./rest/post.rest.js')(router, Post);
/**
 * Comments rest service
 */
require('./rest/comment.rest.js')(router, Comment);
/**
 * Votes rest service
 */
require('./rest/vote.rest.js')(router, Vote);



app.use('/api', router);
// ======================================================

// ================
// START THE SERVER
// ================
//console.log(JSON.stringify(router.stack, undefined, 2));



app.listen(port);
var logMessage = 'API is running on: http://localhost:' + port + '/api';
console.log(logMessage);