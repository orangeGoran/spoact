var express = require('express')
var bodyParser = require('body-parser')
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var moment = require('moment')
var EmailModel = require('./backend/models/email').EmailsModel

var config = require('./backend/config.json')
console.log("START: configuration file from: ./backend/config.json");
console.log();
console.log(config);
console.log();
console.log("END: configuration file from: ./backend/config.json");
console.log("*****************");

mongoose.connect(config.db_url + '/' + config.db_name);

var app = express()

app.set('port', 8888)
app.set('views',__dirname + '/views')
app.set('view engine', 'pug')

app.use(express.static('frontend'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
  host: config.mailer_config.host,
  port: config.mailer_config.port,
  secure: config.mailer_config.secure, // true for 465, false for other ports
  auth: {
    user: config.mailer_config.email, // generated ethereal user
    pass: config.mailer_config.pass // generated ethereal password
  }
});


app.get('/emailWasRead/:id', (req,res) => {
  EmailModel.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), { $set: { delivered: true }}, { new: true }, function (err, document) {
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

app.post('/sendMessage', (req,res) => {
  var data = {
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
    isRead: false,
    dateAdded: moment().format()
  }

  try {
    let newInsert = new EmailModel(data)
    newInsert.save().then((newData) => {
      res.send()

      let mailOptions = {
        from: config.mailer_config.name + ' <' + config.mailer_config.email +'>', // sender address
        to: config.recipientEmails,
        subject: '★ <' + data.email + '> ★ ' + data.subject, // Subject line
        text: data.message, // plain text body
        html: '<span>' + data.message.replace(/\n/g, "<br />") +'</span><br><br><hr>Email was read (please confirm at): ' + config.serverDomainName + '/emailWasRead/' + newData._id
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("ERROR: ")
          console.log(error);
        }else {
          console.log('Message sent: %s', info.messageId);
        }
      });
    });

  } catch (err) {
    console.log("error", err)
    res.status(500).send(err)
  }
})

app.listen(app.get('port'), () =>{
  console.log('App listening on port ' + app.get('port'))
})
