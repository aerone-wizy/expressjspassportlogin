const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator');
const passport = require('passport')
const LocalStartegy = require('passport-local').Strategy

const User = require('../models/user')

//Homepage
router.get('/', (req, res, next) => {
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
        const newUser = new User({name, username, email, password})
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
    }, (req, res) => {
        res.redirect('/')
    })
})

module.exports = router