const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/user')

//Homepage - Dashboard
router.get('/', ensureAuthenticated, (req, res, next) => {
    res.render('index')
})

//Login Form
router.get('/login', (req, res, next) => {
    res.render('login')
})

//Register Form
router.get('/register', (req, res, next) => {
    res.render('register')
})

//Logout
router.get('/logout', (req, res, next) => {
    req.logout()
    req.flash('success_msg', "You are now logged out")
    res.redirect('/login')
})

//Process Register
router.post('/register', [
    body('name').notEmpty().withMessage("Name is required"),
    body('username').notEmpty().withMessage("Username is required"),
    body('email').isEmail().withMessage("Email must be a valide email address"),
    body("password", "Invalid password")
        .isLength({ min: 4 })
        .custom((value,{req, loc, path}) => {
            if (value !== req.body.password2) {
                // trow error if passwords do not match
                throw new Error("Passwords don't match");
            } else {
                return value;
            }
        })
], (req, res) => {
    const name = req.body.name
    const username = req.body.username  
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req);

    if (!errors.isEmpty()){
        res.render('register', {
            errors: errors.array()
        })
    } else {
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password
        })
        User.registerUser(newUser, (err, user) => {
            if(err) throw err
            req.flash('success_msg', 'You are registered and can now login')
            res.redirect('login')
        })
    }
})

//Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username, (err, user) => {
        if (err) throw err
        if(!user){
            return done(null, false, {message: "No user found"})
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if(err) throw err
            if(isMatch){
                return done(null, user)
            } else {
                return done(null, false, {message: "Wrong password"})
            }
        })
    })
}))

passport.serializeUser((user, done) => {
    done(null, user.id);
});
  
passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user);
    });
});

//Login Procesing
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    })(req, res)
})


//Access control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    } else {
        req.flash('error_msg', 'You are not authorized to view that page')
        res.redirect('/login')
    }
}
module.exports = router