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

const isAdmin = (req, res, next) => {
  if (req.cookies.xsecret && req.session.user) {
    if (req.session.user.role === 'Admin') {
      return next()
    }
  }
  return res.status(403).redirect('/dashboard')
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
const navigasiAdminKelolaBarang = require('./navigasi/admin_kelola_barang');

// TABLE ROW
const tableRowAdmin = require('./dashboard/tablerow/admin');
const tableRowStafGudang = require('./dashboard/tablerow/staf_gudang');
const tableRowAdminKelolaRole = require('./dashboard/tablerow/adminKelolaRole');

// DASHBOARD
const dashboardAdmin = require('./dashboard/admin');
const dashboardStafGudang = require('./dashboard/staf_gudang');

// DATA HEADER CONTENT
const dataContentAdmin = require('./dataContent/admin');
const dataContentAdminKelolaRole = require('./dataContent/adminKelolaRole');
const dataContentStafGudang = require('./dataContent/staf_gudang');

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.send({ message: 'hello, You are connected!', user: req.session.user })
  }
  res.redirect('/login')
})

app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard')
  }
  res.render('login')
})

app.post('/login', (req, res) => {
  if (req.session.user) res.redirect('/data')
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

app.get('/dashboard', auth, (req, res) => {
  const { user } = req.session

  let navigasi
  let dashboardContent

  if (user.role === 'Staf Gudang') {
    navigasi = navigasiStafGudang
    dashboardContent = dashboardStafGudang
  } else if (user.role === 'Admin') {
    navigasi = navigasiAdmin
    dashboardContent = dashboardAdmin
  }
  navigasi[0].class = 'active-collection'
  navigasi[1].class = ''
  navigasi[1].href = '/data'
  navigasi[2].href = '/kelola_role'

  res.render('dashboard', {
    navigasi,
    user: req.session.user,
    dashboardContent
  })
})

app.get('/data', auth, (req, res) => {
  const { user } = req.session
  let navigasi
  let dataTR
  let collection
  let dataContent

  if (user.role === 'Staf Gudang') {
    navigasi = navigasiStafGudang
    dataTR = tableRowStafGudang
    dataContent = dataContentStafGudang
    collection = 'barang'
  } else if (user.role === 'Admin') {
    navigasi = navigasiAdmin
    dataTR = tableRowAdmin
    dataContent = dataContentAdmin
    collection = 'user'
  }
  navigasi[0].href = '/dashboard'
  navigasi[0].class = ''
  navigasi[1].class = 'active-collection'
  navigasi[2].href = '/kelola_role'

  db.collection(collection).find({}).sort({ _id: -1 }).toArray()
    .then((data) => {
      res.render('data',
      {
        navigasi,
        user: req.session.user,
        data,
        dataTR,
        dataContent,
        collection
      })
    })
})

app.post('/edit_data/:collection/:fieldCount', (req, res) => {
  const { body } = req
  const { collection, fieldCount } = req.params
  console.log({ body });
  for (let i = 0; i < fieldCount; i++) {
    db.collection(collection).findOneAndUpdate({ _id: ObjectId(body.id) }, {
      $set: {
        [body[`data[${i}][name]`]]: body[`data[${i}][value]`]
      }
    })
    .catch((e) => {
      console.log(e);
    })
  }
  return res.status(200).send()
})

app.post('/delete_data/:collection', (req, res) => {
  const { body } = req
  const { collection } = req.params

  db.collection(collection).findOneAndDelete({ _id: ObjectId(body.id) })
    .then((result) => {
      if (result) return res.status(200).send(result)
      res.status(400).send('Barang Tidak Ditemukan')
    })
    .catch((e) => {
      res.status(400).send(e)
    })
})

app.post('/get_data/:collection', (req, res) => {
  const { body } = req
  const { collection } = req.params
  db.collection(`${collection}`).findOne({ _id: ObjectId(body.id) })
    .then((result) => {
      console.log(result);
      if (result) return res.status(200).send(result)
      return res.status(400).send('Tidak Ditemukan')
    })
    .catch((e) => {
      res.status(400).send({ responseText: e })
    })
})

app.post('/get_count_dashboard/:parameter', (req, res) => {
  const data = []

  db.collection(`${req.params.parameter}`).find({}).count()
    .then((result) => {
      data.push(result)
      res.status(200).send({ data })
    })
    .catch((e) => {
      console.log(e);
    })
})

app.post('/create_data/:collection', (req, res) => {
  const { body } = req
  const { collection } = req.params
  if (collection === 'user') {
    return db.collection(collection).findOne({ username: body.username }, (err, result) => {
      if (result) return res.status(400).send({ responseText: 'Username Tidak Tersedia' })
      db.collection(collection).insertOne(body)
      .then((insertResult) => {
        if (insertResult) res.status(200).send({ responseText: 'Tambah User Baru Berhasil' })
      })
    })
  }
  db.collection(collection).insertOne(body)
  .then((result) => {
    if (result) return res.status(200).send({ responseText: 'Tambah Barang Baru Berhasil' })
    res.status(400).send()
  })
  .catch((e) => {
    res.status(400).send(e)
  })
})

app.get('/kelola_role', isAdmin, (req, res) => {
  const navigasi = navigasiAdminKelolaBarang
  const dataTR = tableRowAdminKelolaRole
  const dataContent = dataContentAdminKelolaRole

  navigasi[0].href = '/dashboard'
  navigasi[1].href = '/data'
  navigasi[2].href = '#'
  navigasi[2].class = 'active-collection'

  db.collection('user').find({}).sort({ _id: -1 }).toArray()
    .then((data) => {
      res.render('kelola_role', {
        navigasi,
        dataTR,
        dataContent,
        data
      })
    })
})

app.get('/keuangan', (req, res) => {
  const navigasi = navigasiAdminKelolaBarang

  res.render('keuangan', {
    navigasi
  })
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
