// =====Import des middlewares
const express = require('express')
 ,path = require('path')
 ,mongoose = require('mongoose')
 ,cookieParser = require('cookie-parser')
 ,expressValidator = require('express-validator')
 ,bodyParser = require('body-parser')
 ,flash = require('connect-flash')
 ,session = require('express-session')
 ,passport = require('passport')
 ,config = require('./config/database')
 ,helmet = require('helmet')
 ,compression = require('compression')
 ,favicon = require('serve-favicon')
 ,csrf = require('csurf')

// ====Routes====
const articles = require('./routes/articles')
 ,users = require('./routes/users')
 ,admin = require('./routes/admin')
 ,moment = require('moment')
moment.locale('fr')

// =====Initialise la connection avec la mongodb====
mongoose.connect(config.database,{
  useNewUrlParser: true,
  useUnifiedTopology: true
})

let db = mongoose.connection


// ====Check connection====
db.once('open', ()=>{
  console.log('Connected to MongoDB')
});
// ====Check for DB errors====
db.on('error', (err)=>{
  console.log(err)
});

// setup route middlewares CSRF
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })


// ====Initialisation Middleware Express====
const app = express()
//  serve favicon
app.use(favicon(path.join('public','favicon.ico')))

// ====variable local===
app.locals.filePath =  "/uploads/"
app.locals.fileResizedPath = "/uploads/resized/resized_"

// ====compress all responses====
app.use(compression())

// ====Bring in Models====
let Article = require('./models/article.model')
let User = require('./models/user.model')

// ====Load View Engine====
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// ====Body-parser Middleware====
//  Analyse le texte en tant que JSON et expose l'objet résultant sur req.body
app.use(bodyParser.json())
//  Analyse le texte en tant que données codées en URL
app.use(bodyParser.urlencoded({ extended: true}))
app.use(cookieParser())


// ====Helmet====
app.use(helmet())


// ====Set Public Folder====
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname + '/static'))
// ====Set Upload folder====
app.use('/uploads',express.static(path.join('uploads')))
app.use('/resized',express.static(path.join('resized')))
app.use(express.static(__dirname+'/public'))

// ====Express Session Middleware====
app.set('trust proxy', 1)
app.use(session({
  secret: 'victorIA',
  resave: true,
  saveUninitialized: true
}))
// ====Express Messages Middleware====
app.use(require('connect-flash')())
app.use( (req, res, next)=> {
  res.locals.messages = require('express-messages')(req, res)
  next()
});

// ====Express Validator Middleware====
app.use(expressValidator({
  errorFormatter: (param, msg, value)=> {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']'
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// ====Passport Config====
require('./config/passport')(passport)
// ====Passport Middleware====
app.use(passport.initialize())
app.use(passport.session())

app.get('*', (req, res, next)=>{
  res.locals.user = req.user || null
  next()
})

//==== CSRF ====//
// CSRF USERS LOGIN
app.get('/users/login', csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.render('login', { csrfToken: req.csrfToken() })
})
// CSRF USERS REGISTER
app.get('/users/register', csrfProtection, function (req, res) {
  res.render('register', { csrfToken: req.csrfToken() })
})
// CSRF USERS DASHBOARD
/* app.get('/users/dashboard', csrfProtection, function (req, res) {
  res.render('dashboard', { csrfToken: req.csrfToken() })
}) */


// CSRF ARTICLES EDIT
app.get('/articles/edit', csrfProtection, function (req, res) {
  // pass the csrfToken to the view
  res.render('edit_article', { csrfToken: req.csrfToken() })
})
// CSRF ARTICLES ADD
app.get('/articles/add', csrfProtection, function (req, res) {
  res.render('add_article', { csrfToken: req.csrfToken() })
})

app.post('/process', parseForm, csrfProtection, function (req, res) {
  res.send('data is being processed')
})


// ====Home Route Async====
app.get('/', function(req, res){
  Article.find({}, function(err, articles){
    if(err){
      console.log(err);
      res.redirect('/')
    } else {
      res.render('index', {
        articles: articles
      });
    }
  });
});

// ====Route Files====
app.use('/articles', articles)
app.use('/users', users)
app.use('/admin', admin)




// ====Start Server====
app.listen(3000, function(){
  console.log('Server started on port 3000...')
});
