const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/myproject';

MongoClient.connect(url, (err) => {
  if (err) {
    return console.log("Can't connect to database!");
  }
  return console.log('Database connected!');
})
