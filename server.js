const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const url = 'mongodb://localhost:27017/dbimpal-A';

const app = express()

app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

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
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  db.collection('user').insertOne(req.body)
  .then((result) => {
    res.send(`Halo, ${result.ops[0].username} aku tau passwordmu! pasti ${result.ops[0].password}`)
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
