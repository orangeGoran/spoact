var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var Emails = new Schema({
  name: {type:String, required: true},
  email: {type:String, required: true},
  subject: {type:String, required: true},
  message: {type:String, required: true},
  dateAdded: {type:Date, required: true},
  delivered: {type: Boolean, default: false, required: true}
});


//registered on mongoose models
EmailsModel = mongoose.model("Emails",Emails);

module.exports.EmailsModel = EmailsModel
