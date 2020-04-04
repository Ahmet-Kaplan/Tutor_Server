var mongoose = require('mongoose')
const ejson = require('mongodb-extended-json')

// Configuration
var config = require('../config')

// Load users into the database
mongoose.connect(config.database, { useNewUrlParser: true })
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('Connected to database')
  let promises = []
  const usersCollection = db.collection('users')
  const seedData = require('../seeds/test_users.json')
  // use Extended JSON to handle formats like "$date" in json files
  const deserializedSeedData = ejson.deserialize(seedData)
  deserializedSeedData.forEach(record => {
    // Build a Unique ID Key for each record to be updated. Start with empty object
    const idKey = { email: record.email }
    const replacePromise = usersCollection.replaceOne(idKey, record, {
      upsert: true
    })
    promises.push(replacePromise)
    console.log(record)
  })

  Promise.all(promises)
    .then(() => {
      console.log('Successfully imported data')
      process.exit()
    })
    .catch(err => {
      throw new Error(err)
    })
})
