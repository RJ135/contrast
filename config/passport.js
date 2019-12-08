// Import des middlewares
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
// Import Schema
const User = require('../models/user.model')
const config = require('../config/database')



// Export du middleware passport
module.exports = function(passport){
  /**
   * Passeport utilise ce qu'on appelle des stratégies pour authentifier les demandes. 
   * Les stratégies vont de la vérification d'un nom d'utilisateur et d'un mot de passe à l'authentification 
   * déléguée par OAuth ou à l'authentification fédérée par OpenID.
   */ 
  passport.use(new LocalStrategy(function(username, password, done){
    // Match Username
    let query = {username:username};
    User.findOne(query, function(err, user){
      if(err) throw err;
      if(!user){
        return done(null, false, {message: 'Utilisateur inconnu'});
      }

      // Match Password
      bcrypt.compare(password, user.password, function(err, isMatch){
        if(err) throw err;
        if(isMatch){
          return done(null, user);
        } else {
          return done(null, false, {message: 'Erreur mot de passe'});
        }
      });
    });
  }));

  // Serialization
  passport.serializeUser((user, done)=> {
    done(null, user.id)
  })

  // Deserialisation
  passport.deserializeUser((id, done)=> {
    User.findById(id, (err, user)=> {
      done(err, user)
    })
  })

}
