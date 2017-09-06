/*eslint no-param-reassign: ["error", { "props": false }]*/
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const hbs = require('hbs');

const url = 'mongodb://localhost:27017/dbimpal-A';

const app = express()

app.set('view engine', 'hbs')
hbs.registerPartials(`${__dirname}/views/partials`);

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
  key: 'xsecret',
  secret: 'bismillahsemogaimpaldapetA',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 600000 },
}))

// middleware function to check for logged-in users
const auth = (req, res, next) => {
  if (req.cookies.xsecret && req.session.user) return next()
  return res.status(403).redirect('login')
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

// NAVIGASI
const navigasiStafGudang = require('./navigasi/staf_gudang')
const navigasiAdmin = require('./navigasi/admin');

// TABLE ROW
const tableRowAdmin = require('./tablerow/admin');
const tableRowStafGudang = require('./tablerow/staf_gudang');

app.get('/', (req, res) => {
  console.log(req.session);
  if (req.session.user) {
    return res.send({ message: 'hello, You are connected!', user: req.session.user })
  }
  res.send({ message: 'hello, You are connected!' })
})

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/')
  }
  res.render('login')
})

app.post('/login', (req, res) => {
  if (req.session.user) res.redirect('/')
  const { username, password } = req.body
  db.collection('user').findOne({ username, password })
  .then((result) => {
    if (!result) {
      return res.status(400).send('Login gagal!')
    }
    req.session.user = result
    res.status(200).send(result)
  })
  .catch((e) => {
    res.status(401).send(e)
  })
})

app.get('/signup', (req, res) => {
  res.render('signup')
})

app.post('/signup', (req, res) => {
  const { body } = req
  db.collection('user').findOne({ username: body.username })
    .then((result) => {
      if (result) return res.status(400).send('username telah digunakan')
      db.collection('user').insertOne(body)
      .then((user) => {
        res.status(200).send(user.ops[0])
      })
    })
})

app.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

app.get('/dashboard', (req, res) => {
  const { user } = req.session
  let navigasi

  if (user.role === 'Staf Gudang') {
    navigasi = navigasiStafGudang
  } else if (user.role === 'Admin') {
    navigasi = navigasiAdmin
  }
  navigasi[0].class = 'active-collection'
  navigasi[1].class = ''
  navigasi[1].href = '/data'

  res.render('dashboard', {
    navigasi,
    user: req.session.user
  })
})

app.get('/data', (req, res) => {
  const { user } = req.session
  let navigasi
  let dataTR
  let collection

  if (user.role === 'Staf Gudang') {
    navigasi = navigasiStafGudang
    dataTR = tableRowStafGudang
    collection = 'barang'
  } else if (user.role === 'Admin') {
    navigasi = navigasiAdmin
    dataTR = tableRowAdmin
    collection = 'user'
  }
  navigasi[0].href = '/dashboard'
  navigasi[1].class = 'active-collection'
  navigasi[0].class = ''

  db.collection(collection).find({}).sort({ _id: -1 }).toArray()
    .then((data) => {
      res.render('data', { navigasi,
        user: req.session.user,
        data,
        dataTR
      })
    })
})

app.post('/edit_data_barang', (req, res) => {
  const { body } = req
  db.collection('barang').findOneAndUpdate({ _id: ObjectId(body.id_barang) }, {
    $set: {
      nama_barang: body['data[nama_barang]']
    },
  }, {
    upsert: true,
    new: true
  })
  .then((result) => {
    if (result) return res.status(200).send(result)
    return res.status(400).send('Gagal Edit Data Barang')
  })
  .catch((e) => {
    res.status(400).send(e)
  })
})

app.post('/hapus_data_barang', (req, res) => {
  const { body } = req

  db.collection('barang').findOneAndDelete({ _id: ObjectId(body.id_barang) })
    .then((result) => {
      if (result) return res.status(200).send(result)
      res.status(400).send('Barang Tidak Ditemukan')
    })
    .catch((e) => {
      res.status(400).send(e)
    })
})

app.post('/get_data_barang', (req, res) => {
  const { body } = req
  db.collection('barang').findOne({ _id: ObjectId(body.id_barang) })
    .then((result) => {
      if (result) return res.status(200).send(result)
      return res.status(400).send('Tidak Ditemukan')
    })
    .catch((e) => {
      res.status(400).send({ responseText: e })
    })
})

app.post('/get_count_dashboard', (req, res) => {
  db.collection('barang').find({}).count()
    .then((result) => {
      res.status(200).send({ data_barang: result })
    })
    .catch((e) => {
      console.log(e);
    })
})

app.post('/tambah_data_barang', (req, res) => {
  const { body } = req

  db.collection('barang').insertOne(body)
    .then((result) => {
      if (result) return res.status(200).send({ responseText: 'Tambah Barang Baru Berhasil' })
      res.status(400).send()
    })
    .catch((e) => {
      res.status(400).send(e)
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
    })
})

app.get('/keuangan', (req, res) => {
  res.render('keuangan')
})

app.get('/all_user', (req, res) => {
  db.collection('user').find().toArray((err, results) => {
    if (err) console.log('Gagal mencari');
    res.send(results)
  })
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
