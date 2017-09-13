/*eslint no-param-reassign: ["error", { "props": false }]*/
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cookieParser = require('cookie-parser');
const session = require('express-session');
const hbs = require('hbs');

// REGISTER HELPER FOR HANDLEBARS
hbs.registerHelper('ifCond', function (v1, v2, options) {
  if (v1 === v2) return options.fn(this)
  return options.inverse(this)
})

const url = 'mongodb://localhost:27017/dbimpal-A';

const app = express()

app.set('view engine', 'hbs')
hbs.registerPartials(`${__dirname}/views/partials`);

app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// initialize cookie-parser to allow us access the cookies stored in the browser.
app.use(cookieParser())

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

const isKasir = (req, res, next) => {
  if (req.cookies.xsecret && req.session.user) {
    if (req.session.user.role.toUpperCase() === 'KASIR') {
      return next()
    }
  }
  return res.status(403).redirect('/dashboard')
}

let db

MongoClient.connect(url)
  .then((database) => {
    db = database
    console.log('connected to database!')
  })
  .catch(() => {
    console.log('Gagal connect ke database!')
  })

// NAVIGASI
const navigasiStafGudang = require('./navigasi/staf_gudang')
const navigasiAdmin = require('./navigasi/admin')
const navigasiManajer = require('./navigasi/manajer')
const navigasiBendahara = require('./navigasi/bendahara')
const navigasiKasir = require('./navigasi/kasir')

// TABLE ROW
const tableRowAdmin = require('./dashboard/tablerow/admin')
const tableRowStafGudang = require('./dashboard/tablerow/staf_gudang')
const tableRowAdminKelolaRole = require('./dashboard/tablerow/adminKelolaRole')
const tableRowManajer = require('./dashboard/tablerow/manajer')
const tableRowKasir = require('./dashboard/tablerow/kasir_pembelian_barang')

// DASHBOARD
const dashboardAdmin = require('./dashboard/admin')
const dashboardStafGudang = require('./dashboard/staf_gudang')
const dashboardManajer = require('./dashboard/manajer')
const dashboardBendahara = require('./dashboard/bendahara')
const dashboardKasir = require('./dashboard/kasir')

// DATA CONTENT
const dataContentAdmin = require('./dataContent/admin')
const dataContentAdminKelolaRole = require('./dataContent/adminKelolaRole')
const dataContentStafGudang = require('./dataContent/staf_gudang')
const dataContentManajer = require('./dataContent/manajer')
const dataContentKasir = require('./dataContent/kasir_pembelian_barang')

app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard')
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
    navigasi[2].href = '/kelola_role'
  } else if (user.role === 'Manajer') {
    navigasi = navigasiManajer
    dashboardContent = dashboardManajer
  } else if (user.role === 'Bendahara') {
    navigasi = navigasiBendahara
    dashboardContent = dashboardBendahara
  } else if (user.role === 'Kasir') {
    navigasi = navigasiKasir
    dashboardContent = dashboardKasir
  }

  navigasi[0].class = 'active-collection'
  navigasi[1].class = ''
  navigasi[1].href = '/data'
  navigasi[2].class = ''

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
    navigasi[2].href = '/kelola_role'
  } else if (user.role === 'Manajer') {
    navigasi = navigasiManajer
    dataTR = tableRowManajer
    dataContent = dataContentManajer
    collection = 'barang'
  } else if (user.role === 'Kasir') {
    navigasi = navigasiKasir
    dataTR = tableRowKasir
    dataContent = dataContentManajer
    collection = 'barang'
  }

  navigasi[0].href = '/dashboard'
  navigasi[1].href = '#'
  navigasi[0].class = ''
  navigasi[1].class = 'active-collection'
  navigasi[2].class = ''

  db.collection(collection).find({
    username: {
      $ne: 'admin'
    }
  }).sort({ _id: -1 }).toArray()
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
      console.log(e)
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
  db.collection(collection).findOne({ _id: ObjectId(body.id) })
    .then((result) => {
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
      console.log(e)
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
  const { user } = req.session
  const navigasi = navigasiAdmin
  const dataTR = tableRowAdminKelolaRole
  const dataContent = dataContentAdminKelolaRole

  navigasi[0].href = '/dashboard'
  navigasi[1].href = '/data'
  navigasi[2].href = '#'
  navigasi[0].class = ''
  navigasi[1].class = ''
  navigasi[2].class = 'active-collection'

  db.collection('user').find({
    username: {
      $ne: 'admin'
    }
  }).sort({ _id: -1 }).toArray()
    .then((data) => {
      res.render('kelola_role', {
        user,
        navigasi,
        dataTR,
        dataContent,
        data
      })
    })
})

app.post('/kelola_role', (req, res) => {
  const { body } = req
  console.log(body);
  db.collection('user').findOneAndUpdate({
    _id: ObjectId(body.id)
  }, {
    $set: {
      role: body.role
    }
  })
    .then((result) => {
      console.log(result);
      if (result) return res.status(200).send()
      res.status(400).send('Something wrong!')
    })
    .catch((e) => {
      res.status(400).send(e)
    })
})

app.get('/keuangan', isKasir, (req, res) => {
  const navigasi = navigasiAdmin
  const dataContent = dataContentStafGudang
  const dataTR = tableRowStafGudang

  res.render('keuangan', {
    navigasi,
    dataContent,
    dataTR
  })
})

function checkStokBarang(datas) {
  const promises = datas.map((data) => {
    return new Promise((resolve, reject) => {
      const id = data[0]
      const namaBarang = data[1]
      const count = data[2]
      db.collection('barang').findOne({ _id: ObjectId(id) }, (err, result) => {
        if (Number(result.stok) < Number(count)) {
          reject(namaBarang)
        } else {
          resolve()
        }
      })
    })
  })
  return Promise.all(promises)
  .then(() => {
    return true
  })
  .catch((namaBarang) => {
    return namaBarang
  })
}

app.post('/add_pembelian', (req, res) => {
  const { body } = req
  const data = []
  for (let i = 0; i < body.countBelanja; i++) {
    data.push(body[`data[${i + 2}][]`])
  }
  const check = checkStokBarang(data)
  check.then((a) => {
    if (a === true) {
      res.status(200).send({
        text: 'Pembelian barang berhasil dilakukan',
        type: 'success'
      })
    } else {
      res.status(400).send({
        text: `Maaf, ${a} stok tidak mencukupi`,
        type: 'error'
      })
    }
  })
  .catch((e) => {
    res.status(400).send({
      text: `Maaf, ${e} stok tidak mencukupi`,
      type: 'error'
    })
  })
})

app.get('/get_id_barang', (req, res) => {
  db.collection('barang').find().toArray()
    .then((result) => {
      if (!result) return res.status(400).send()
      return res.status(200).send(result)
    })
    .catch((e) => {
      res.status(400).send(e)
    })
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
