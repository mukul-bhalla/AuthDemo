const express = require('express');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session')
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/authDemo')
    .then(() => {
        console.log("Mongo Connection Open !!")
    })
    .catch((err) => {
        console.log("Oh no Mongo Error");
        console.log(err);
    })
app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret', resave: false, saveUninitialized: true }));
const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login');
    }
    else {
        next();
    }
}


app.get('/', (req, res) => {
    res.send("Welcome to home page");
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username: username, password: password });
    await user.save()
    req.session.user_id = user._id
    res.redirect('/secret')
    // res.send(hashed);
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id
        res.redirect('/secret');

    }
    else {
        res.send('Try again')
    }
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})

app.get('/secret', requireLogin, (req, res) => {

    res.render('secret');
})

app.listen(3000, () => {
    console.log('Listening at Port-3000')
})