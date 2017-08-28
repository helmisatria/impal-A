const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/myproject';

const app = express()

app.set('view engine', 'hbs')
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let db

MongoClient.connect(url)
  .then((database) => {
    console.log('connected!');
    db = database
  })
  .catch((err) => {
    return err
  })

app.get('/', (req, res) => {
  res.send({ message: 'hello, You are connected!' })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  res.send(req.body)
})

app.get('/data_user', (req, res) => {
  db.collection('user').insertOne({
    name: 'Helmi Satria'
  }, (err, msg) => {
    res.render('data_user', { msg: msg.ops[0] })
  })
})

app.get('/all_user', (req, res) => {
  db.collection('user').find().toArray((err, results) => {
    res.render('all_user', { results })
  })
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
