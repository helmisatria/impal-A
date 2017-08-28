const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017/myproject';

const database = MongoClient.connect(url)
  .then((db) => {
    console.log('connected!');
    return db
  })
  .catch((err) => {
    return err
  })

module.exports = database
