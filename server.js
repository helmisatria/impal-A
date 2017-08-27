const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.set('view engine', 'hbs')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

require('./db/config');

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
  res.render('data_user')
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
