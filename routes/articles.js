// ====Import modules====
const express = require('express')
const router = express.Router()
// Modèles
const Article = require('../models/article.model')
const User = require('../models/user.model')
// Upload images
const multer = require('multer')
const sharp = require('sharp')
// Gestion dates
const moment = require('moment')
moment.locale('fr')


/**
 * MULTER
 */
// ====Définition stockage des fichiers====
const storage = multer.diskStorage({
  destination: (req, file, cb)=> {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb)=> {
    cb(null,file.originalname)
  }
});

// ====Filtre types photos====
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
  
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// ====Destination des uploads====
const upload = multer({
  dest: '/uploads/',
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: fileFilter
});


/**
 * UPLOAD ARTICLE + PHOTO
 */
// ====Route page ajouter photo====
router.get('/add', ensureAuthenticated, (req, res)=>{
  res.render('add_article', {
    title:'Add Article'
  })
})

// ====Route submit ajout photo====
router.post('/add', upload.single('photo'), async(req, res) => {
  const article = new Article();
  article.photo = req.file.filename;
  article.title = req.body.title;
  article.author = req.user._id;
  article.description = req.body.description;
  article.price = req.body.price;
    
  const width = 640;
  const height = 640;
  
  try {
    await article.save()
    // Resize image
    sharp(req.file.path)
    .resize(width,height)
    .toFile('uploads/resized/resized_'+req.file.originalname, (err)=>{
      if (err) {
        req.flash('danger','problème de redimension')
        res.redirect('/')
      } else {
        
        req.flash('success','Nouvelle photo publiée !')
        res.redirect('/')
      }
    })
  } catch {
    const errors = req.validationErrors()
    res.render('add_article', {
      title:'Add Article',
      errors:errors
    })
  }
})


/**
 * EDITION ARTICLE
 */
// ====Route page edit====
router.get('/edit/:id', async(req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    res.render('edit_article', {
      title:'Edit Article',
      article:article,
      //author: author
    })
  } catch {
    req.flash('danger','Vous n\'êtes pas propriétaire de cette photo')
    res.redirect('/')
  }
})

// ====Route submit page edit==== 
router.post('/edit/:id', async(req, res)=>{

  let article = {};

  try {
    article.title = req.body.title;
    article.author = req.user._id;
    article.description = req.body.description;
    article.price = req.body.price;
    article.modifAt = moment(new Date()).format('DD/MM/YYYY, h:mm:ss');

    let query = {_id:req.params.id}

    await Article.updateOne(query, article)

    req.flash('success', 'modification ')
    return res.redirect('/');

  } catch {
    req.flash('danger','Erreur de mise à jour photo !')
    res.redirect('/');
  }
})

/**
 * DELETE ARTICLE
 */

// ====Route supprimer article====
router.delete('/:id', (req, res)=>{

  if(!req.user.id){
    res.status(500).redirect('/')
  }
  let query = {_id:req.params.id}

  Article.findOneAndDelete(req.params.id, (err, article)=>{
    if (err) {
      throw err
    }
    if(article.author != req.user.id){
      res.status(500).send()
    } else {
      Article.deleteOne(query, (err)=>{
        if(err){
          console.log('ERREUR DELETE article :'+err)
        }
        res.send('success')
      });
    }
  });
  req.flash('danger','photo supprimée!')
});



/**
 * SHOW ARTICLE
 */
// ====Route voir article====
router.get('/:id', async(req, res) => {
  try {
    const article = await Article.findById(req.params.id)
    const user = await User.findById(article.author)
    res.render('article',{
      article:article,
      author: user,
      moment: require('moment')
      }
    )
  } catch {
    req.flash('danger','Veuillez vous connecter')
    res.redirect('/')
  }
})

// ====Gestion controle des accès====
function ensureAuthenticated(err,req, res, next){
  if(req.isAuthenticated()){
    return next()
  } else {
    req.flash('danger','Veuillez vous connecter')
    res.redirect('/users/login')
  }
}

// ====Export des routes articles====
module.exports = router
