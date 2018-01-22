var express = require('express');
var app = express();
var port = process.env.PORT || 8000;
var morgan = require('morgan');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
var appRoutes = require('./app/routes/api')(router);
var path = require('path');
var passport = require('passport');
var social = require('./app/passport/passport')(app,passport);

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use('/api',appRoutes);

mongoose.connect('mongodb://localhost:27017/meanapp',  function(err) {
  if(err)
    console.log('Not connected to mongodb');
  else
    console.log('connected to mongo database');
});

app.get('*', function(req,res){
  res.sendFile(path.join(__dirname + '/public/app/views/index.html'))
})

app.listen(port, function (){
  console.log("Running The Server on port" + port)
});
