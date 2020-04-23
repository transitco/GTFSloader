const mongoose = require('mongoose');
const express = require('express');
const gtfs = require('gtfs');
const config = require('./gtfs/config.json');
const zipper = require('zip-local');

mongoose.connect('mongodb://mongo:27017/gtfs', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
});

const app = express();

app.post('/import_gtfs', (req, res, next) => {
  gtfs.import(config)
      .then(() => {
        console.log('Import Successful');
        res.send({ message: 'Import Successful' });
        return mongoose.connection.close();
      })
      .catch((err) => {
        console.error(err);
        res.send({ message: 'Import failed' });
      });
});

app.get('/export_gtfs', (req, res, next) => {
  gtfs.export(config)
      .then(() => {
        console.log('Export Successful');
        zipper.sync.zip('/usr/src/app/gtfsloader/gtfs-export/rtl_gtfs').compress().save('rtl_gtfs.zip');
        const file = '/usr/src/app/gtfsloader/gtfs-export/rtl_gtfs/rtl_gtfs.zip';
        res.download(file);
        return mongoose.connection.close();
      })
      .catch((err) => {
        console.error(err);
      });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


