const express = require('express');
const Doctor = require("../model/doctor_model.js");
const cookieParser = require('cookie-parser');
const router = new express.Router();
const bodyParser = require("body-parser");
const app = express();
app.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: false }))
const bcrypt = require('bcrypt');
router.use(bodyParser.json())

router.post('/login', async (req, res) => {
    try {
        const doctor = await Doctor.findByCredentials(
            req.body.email,
            req.body.password
        );
        if (!doctor || doctor === null) {
            return res.render('login', {
                error: 'Wrong email or password',
                email: email
            })
        }
        res.cookie('email', req.body.email, { expire: 360000 + Date.now() });
        res.redirect('/dashboard');
    } catch (error) {
        return res.render('login', {
            error: 'Wrong email or password',
            email: req.body.email
        })
    }
})

router.post('/signup', async (req, res) => {
    const email = req.body.email;
    const doctor = new Doctor(req.body);
    try {
        const exists = await Doctor.findOne({ email });
        if (exists) {
            return res.render('signup', {
                error: 'An account with this email already exists'
            });
        }
        if (req.body.password.length < 6) {
            return res.render('signup', {
                error: 'Password too weak'
            });
        }
        await doctor.save();
        res.cookie('email', email, { expire: 360000 + Date.now() });
        res.redirect('dashboard');
    } catch (error) {
        console.log(error);
        res.redirect('signup');
    }
})
router.post('/dashboard/changepassword', async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ email: req.body.email });
        const isMatch = await bcrypt.compare(req.body.old_pwd, doctor.password);
        if (!isMatch) {
            return res.render('changepassword', {
                error: "Wrong Password",
                age: req.body.age,
                name: req.body.name,
                email: req.body.email
            })
        }
        if (req.body.new_pwd !== req.body.password) {
            return res.render('changepassword', {
                "error": "Password Doesn't match",
                "age": req.body.age,
                "name": req.body.name,
                "email": req.body.email
            })
        }
        if (req.body.new_pwd.length < 7) {
            return res.render('changepassword', {
                "error": "Password too weak",
                "age": req.body.age,
                "name": req.body.name,
                "email": req.body.email
            })
        }
        req.body.password = await bcrypt.hash(req.body.password, 8);
        await Doctor.findByIdAndUpdate(doctor._id, req.body);
        res.redirect('dashboard');
    } catch (error) {
        console.log(error);
    }

})
router.post('/dashboard/updateprofile', async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ email: req.body.email });
        await Doctor.findByIdAndUpdate(doctor._id, req.body);
        res.redirect('/dashboard');
    } catch (error) {
        console.log(error);
    }
});

router.post('/patient', async (req, res) => {
    try {
        const doctors = await Doctor.find();
    } catch (error) {
        console.log(error);
    }
})
module.exports = router