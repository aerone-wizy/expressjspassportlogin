const express = require('express');
const path = require('path')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const _handlebars = require('handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')

//Init app
const app = express()

const port = 3000

//Route files
const index = require('./routes/index')

//Sets our app to use the handlebars engine
app.engine('handlebars', exphbs({ defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(_handlebars)}));
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'handlebars');

// Require static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

//body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

//Express session
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}))

//Init passport
app.use(passport.initialize())
app.use(passport.session())

//Express messages
app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next()
})

app.use('/', index)

app.listen(port, () => {
    console.log("Server started on port " + port)
})



// //Mongoose Connect
// mongoose.connect('mongodb://localhost/sportsblog')
// const db = mongoose.connection

// //Moment
// app.locals.moment = require('moment')

// //set static folder
// app.use(express.static(path.join(__dirname, "public")))
