// Import mongoose
const mongoose = require('mongoose')
/* mongoose.set('useCreateIndex', true); */
const moment = require('moment')
moment.locale('fr')

// Modele utilisateur
const UserSchema = new mongoose.Schema({

  name: { type: String, required: true, unique: true },
  email: { type: String, required: true,unique: true, lowercase: true },
  username: { type: String, required: true,unique: true },
  password: { type: String, required: true },
  authorized: { type:Boolean, required:true, default:true },
  creatAt: { type: Date, default:moment().format('L, HH:mm:ss') },
  modifAt: { type: Date, default:moment().format('L, HH:mm:ss') },
  photoUnit : { type : mongoose.Types.ObjectId, required :false, ref :'Article' }
});

// Export du modele utilisateur
module.exports = mongoose.model('User', UserSchema)

    