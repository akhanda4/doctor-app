const path = require("path");
const express = require('express');
require("./db/mongoose");
const hbs = require('hbs');
const app = express();
const port = 3000;
const Doctor = require("./model/doctor_model.js");
const cookieParser = require('cookie-parser');


const doctorRouter = require("./router/doctor.js");

app.listen(port, () => console.log(`Example app listening on port ${port}`));

const publicDirectoryPath = path.join(__dirname, '../public');
const viewsPath = path.join(__dirname, '../templates/views');

app.set('view engine', 'hbs');
app.set('views', viewsPath);

app.use(express.static(publicDirectoryPath));
app.use(doctorRouter);
app.use(cookieParser());

app.get('/login', async (req, res) => {
    const email = req.cookies;
    const user = await Doctor.findOne({ email: email.email });
    if (user) {
        return res.redirect('/dashboard');
    }
    res.render('login');
})
app.get('/signup', async (req, res) => {
    const email = req.cookies;
    const user = await Doctor.findOne({ email: email.email });
    if (user) {
        return res.redirect('/dashboard');
    }
    res.render('signup');
})

app.get('/dashboard', async (req, res) => {
    const email = req.cookies;

    if (!email.email) {
        return res.redirect('/login')
    }
    let doctor = await Doctor.findOne({ email: email.email });
    if (!doctor) {
        return res.redirect('/login')
    }
    res.render('dashboard', {
        status: doctor.status
    });
});

app.get('/dashboard/editprofile', async (req, res) => {
    const email = req.cookies;

    if (email.email === undefined) {
        return res.redirect('/login');
    } else {
        let doctor = await Doctor.findOne({ email: email.email })
        if (!doctor) {
            res.clearCookie('email', { expire: Date.now() - 36000 });
            return res.redirect('/login');
        }
        let selected1 = "";
        let selected2 = "";
        if (doctor.status == "enable") {
            selected1 = "Selected"
        }
        else {
            selected2 = "Selected"
        }
        res.render('doc_profile', {
            age: doctor.age,
            name: doctor.name,
            email: doctor.email,
            selected1: selected1,
            selected2: selected2
        });
    }
})
app.get('/dashboard/logout', (req, res) => {
    res.clearCookie('email', { expire: Date.now() - 36000 });
    res.redirect('/login');
})
app.get('/dashboard/changepassword', (req, res) => {
    const email = req.cookies;
    if (!email.email) {
        return res.redirect('/login')
    }
    res.render('changepassword', {
        email: email.email
    });
})



app.get('/patient', async (req, res) => {
    try {
        var doctors = await Doctor.find({ status: 'enable' });

        res.render('patient', { doctors });
    } catch (error) {
        console.log(error);
    }
})
app.get("/dashboard/*", async (req, res) => {
    const email = req.cookies;
    if (!email.email) {
        return res.redirect('/login')
    }
    const user = await Doctor.findOne({ email: email.email });
    if (user) {
        return res.redirect('/dashboard');
    }
    res.redirect('login');
})
app.get('/deleteprofile', async (req, res) => {
    let email = req.cookies;
    email = email.email;
    let count = await Doctor.deleteOne({ email: email });
    res.clearCookie('email', { expire: Date.now() - 36000 });
    res.redirect('/login');
})

app.get('/patient', (req, res) => {
    res.render('patient')
})

app.get('/', (req, res) => {
    const email = req.cookies;
    if (!email.email) {
        return res.redirect('/login')
    }
    res.redirect('/dashboard')
})
app.get('*', (req, res) => {
    res.redirect('/login')
})

