const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cookieParser = require('cookie-parser');
const session = require('express-session');

const url = 'mongodb://localhost:27017/dbimpal-A';

const app = express()

app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
  key: 'xsecret',
  secret: 'helo!',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

// This middleware will check if user's cookie is still saved in browser and user is not set,
// then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still
// remains saved in the browser.
// app.use((req, res, next) => {
//     if (req.cookies.xsecret && !req.session.user) {
//       res.clearCookie('xsecret');
//     }
//     next();
// });

// middleware function to check for logged-in users
const sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.xsecret) {
        res.redirect('/');
    } else {
        next();
    }
};

let db

MongoClient.connect(url)
  .then((database) => {
    db = database
    console.log('connected to database!');
  })
  .catch(() => {
    console.log('Gagal connect ke database!');
  })

app.get('/', (req, res) => {
  res.send({ message: 'hello, You are connected!' })
  // Cookies that have not been signed
  console.log('Session: ', req.session)
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
  console.log('User: ', req.session);
})

app.get('/login', sessionChecker, (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  db.collection('user').insertOne(req.body)
  .then((result) => {
    res.send(`Halo, ${result.ops[0].username} aku tau passwordmu! pasti ${result.ops[0].password}`)
    req.session.user = result.ops[0]
    req.session.views = 1
    console.log(result.ops[0]);
    console.log('user: ', req.session);
    // console.log(req.session.cookie);
  })
})

app.get('/insert_user', (req, res) => {
  db.collection('user').insertOne({
    nama: 'Helmi Satria BARU'
  })
    .then((result) => {
      res.send(result.ops[0])
      console.log(result)
    })
    .catch((err) => {
      res.send(err)
    })
})

app.get('/delete/:iduser', (req, res) => {
  const id = ObjectId(req.params.iduser)
  // const id = req.params.iduser
  db.collection('user').deleteOne({ _id: id })
    .then((result) => {
      // console.log(result);
      res.send(result)
    })
    .catch((err) => {
      res.send(err)
      console.log(err);
    })
})

app.get('/all_user', (req, res) => {
  db.collection('user').find().toArray((err, results) => {
    if (err) console.log('Gagal mencari');
    res.send(results)
    console.log(results);
  })
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
