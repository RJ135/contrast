// Import middlewares
const mongoose = require('mongoose')
mongoose.set('useCreateIndex', true);
const moment = require('moment')
moment.locale('fr')

// Modele article
const articleSchema = new mongoose.Schema({

  photo: { type: String, required :true},
  title: { type: String, required :true},
  author: { type : mongoose.Types.ObjectId, required :true, ref :'User'},
  description: { type: String, required :false},
  price: { type: Number, required :true},
  authorized: { type:Boolean, required:true, default:true },
  creatAt: { type: Date, default:moment().format('L, HH:mm:ss')},
  modifAt: { type: Date, default:moment().format('L, HH:mm:ss')}
})

// Export modele Article
module.exports = mongoose.model('Article', articleSchema)