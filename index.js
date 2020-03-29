var mongoose = require('mongoose');
var gtfs = require('gtfs');
const config = require('./gtfs/config.json');
//const resolvers = require('./graphql/resolvers/resolvers.js')

mongoose.connect('mongodb://mongo:27017/gtfs', {useNewUrlParser: true, useUnifiedTopology: true});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

gtfs.import(config)
.then(() => {
  console.log('Import Successful');
})
.catch(err => {
  console.error(err);
});
