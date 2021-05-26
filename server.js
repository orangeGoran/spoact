var express = require('express')
var bodyParser = require('body-parser')
var nodemailer = require('nodemailer');
// var mongoose = require('mongoose');
var moment = require('moment')
var EmailModel = require('./backend/models/email').EmailsModel
var path = require("path");

var request = require('request')

var config = require('./backend/config.json')
console.log("START: configuration file from: ./backend/config.json");
console.log();
console.log(config);
console.log();
console.log("END: configuration file from: ./backend/config.json");
console.log("*****************");

// mongoose.connect(config.db_url + '/' + config.db_name);

var app = express()

app.set('port', 8888)
app.set('views', __dirname + '/views')
app.set('view engine', 'pug')

app.use(express.static('frontend'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/emailWasRead/:id', (req, res) => {
  EmailModel.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), { $set: { delivered: true } }, { new: true }, function (err, document) {
    if (err) console.log(err);
    var data = {
      dateAdded: moment(document.dateAdded).format("DD. MM. YYYY, ob HH:mm"),
      email: document.email,
      name: document.name,
      subject: document.subject,
      message: document.message
    }
    res.send(data);
  });
})

app.get('/spo', (req, res) => {
  res.sendFile(path.join(__dirname + '/frontend/spo.html'))
})



app.listen(app.get('port'), () => {
  console.log('App listening on port ' + app.get('port'))
})
