var express = require('express')
var bodyParser = require('body-parser')
var nodemailer = require('nodemailer');
var mongoose = require('mongoose');
var moment = require('moment')
var EmailModel = require('./backend/models/email').EmailsModel
var path    = require("path");

var request = require('request')

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

app.get('/spo', (req, res) => {
  res.sendFile(path.join(__dirname+'/frontend/spo.html'))
})

app.post('/sendMessage', (req,res) => {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  var data = {
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message,
    isRead: false,
    dateAdded: moment().format(),
  }

  if(!data.name || data.name.length == 0 || !data.email || data.email.length == 0 || !data.message || data.message.length == 0 || !data.subject || data.subject.length == 0) {
    res.status(406).send({message: "Wrong inputs!"})
    return;
  }

  try {
    // res.status(406).send({message: "Something is wrong!"})
    // return;
    request.post({
      url:'https://www.google.com/recaptcha/api/siteverify',
      form: {
        secret:config.recaptchaSecret,
        response:req.body.captchaKey
      }
    }, function(err,httpResponse,body){
      body = JSON.parse(body)

      if(body.success) {
        let newInsert = new EmailModel(data)
        newInsert.save().then((newData) => {
          data._id = newData._id
          sendEmail(data)
          res.send()
        });
      }else {
        res.status(406).send({message: "Something is wrong!"})
      }
    })

  } catch (err) {
    console.log("error", err)
    res.status(500).send(err)
  }
})

function sendEmail(data) {
  let mailOptions = {
    from: config.mailer_config.name + ' <' + config.mailer_config.email +'>', // sender address
    to: config.recipientEmails,
    subject: '★ <' + data.email + '> ★ ' + data.subject, // Subject line
    text: data.message, // plain text body
    html: '<span>' + data.message.replace(/\n/g, "<br />") +'</span><br><br><hr>Email was read (please confirm at): ' + config.serverDomainName + '/emailWasRead/' + data._id
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("ERROR: ")
      console.log(error);
    }else {
      console.log('Message sent: %s', info.messageId);
    }
  });
}
app.listen(app.get('port'), () =>{
  console.log('App listening on port ' + app.get('port'))
})
