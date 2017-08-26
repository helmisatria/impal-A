const express = require('express');
const bodyParser = require('body-parser');

const app = express()

app.set('view engine', 'hbs')

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({ message: 'hello, You are connected!' })
})

app.get('/login', (req, res) => {
  res.render('login')
})

app.post('/login', (req, res) => {
  console.log(req.body);
  res.send(req.body)
})

app.listen(8000, (err) => {
  if (err) throw err

  console.log('Connected on port 8000');
})
