/*eslint no-param-reassign: ["error", { "props": false }]*/
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
  cookie: { maxAge: 60000 },
}))

// middleware function to check for logged-in users
const auth = (req, res, next) => {
  db.collection('user').findOne({ token: req.headers.cookie.xsecret })
    .then((result) => {
      if (!result) throw console.log('not found!');
      app.set('user', result)
      console.log(result);
      next()
    })
    .catch((e) => {
      res.status(401).send(e)
    })
}

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
  console.log(req.session);
  res.send({ message: 'hello, You are connected!' })
})

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/')
  }
  res.render('login')
})

app.post('/login', (req, res) => {
  const { username, password } = req.body
  db.collection('user').findOne({ username, password })
  .then((result) => {
    if (!result) {
      return console.log('Tidak ditemukan');
    }
    req.session.user = result
    res.send(`halo! ${result.username}`)
  })
  .catch((e) => {
    res.status(401).send(e)
  })
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
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

app.get('/all_user', auth, (req, res) => {
  db.collection('user').find().toArray((err, results) => {
    if (err) console.log('Gagal mencari');
    res.send(results)
  })
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
