// ====Import middlewares====
const express = require('express')
const router = express.Router()
// securite
const bcrypt = require('bcryptjs')
const passport = require('passport')
// module gestion dates
const moment = require('moment')
moment.locale('fr')

// ====modeles====
const User = require('../models/user.model')
const Article = require('../models/article.model')

/**
 * REGISTER USER
 */
// ====Route vers page inscription====
router.get('/register', (req, res) =>{
  res.render('register')
});

// ====Procédure d'enregistrement====
router.post('/register', function(req, res){
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;
  const modifAt = moment(new Date()).format('L, HH:mm:ss');
  const creatAt = moment(new Date()).format('L, HH:mm:ss');

  req.checkBody('name', 'Nom requis').notEmpty();
  req.checkBody('email', 'Email requis').notEmpty();
  req.checkBody('email', 'le format email n\'est pas valide').isEmail();
  req.checkBody('username', 'Un pseudo est requis').notEmpty();
  req.checkBody('password', 'Un mot de passe est requis').notEmpty();
  req.checkBody('password2', 'Les mots de passe ne correspondent pas').equals(req.body.password);

  /**
   * TAF
   * REGEX var myreg = ^.*(?=.{5,})((?=.*['"#`^*]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$
   * Est requis 5 lettres consécutive dont au moins :
   * 1 lettre minuscule, 1 lettre majuscule, 1 chiffre et  1 caractère spécial = '"#`^*
   */

  let errors = req.validationErrors();

  if(errors){
    res.render('register', {
      errors:errors
    });
  } else {
    let newUser = new User({
      name:name,
      email:email,
      username:username,
      password:password,
      creatAt:creatAt,
      modifAt:modifAt
    });

    bcrypt.genSalt(10, function(err, salt){
      bcrypt.hash(newUser.password, salt, function(err, hash){
        if(err){
          console.log(err);
        }
        newUser.password = hash;
        newUser.save(function(err){
          if(err){
            console.log(err);
            return;
          } else {
            req.flash('success','Vous êtes enregistré(e), vous pouvez vous connecter');
            res.redirect('/users/login');
          }
        });
      });
    });
  }
});


/**
 * CONNECTION USER
 */
// ====Route vers page connexion====
router.get('/login', (req, res)=>{
  res.render('login')
})

// ====Vérification connexion utilisateur====
router.post('/login', (req, res, next)=>{
  passport.authenticate('local', {
    successRedirect:'/',
    successFlash: 'Vous êtes connecté(e)' ,
    failureRedirect:'/users/login',
    failureFlash: true
  })(req, res, next)
})



/**
 * LOGOUT USER
 */
// ====Route vers page déconnection====
router.get('/logout', async(req, res)=>{
  req.logout()
  await req.flash('success', 'Vous êtes déconnecté(e)')
  res.redirect('/')
})



/**
 * DASHBOARD USER
 */
// ====Route vers Dashboard/Edition user====
router.get('/dashboard', async(req, res)=>{
  const user = await User.findById(req.user._id)
  res.render('dashboard',{
      user : user,
      moment: require('moment')
    }
  )
})



// ====Export des routes users====
module.exports = router
