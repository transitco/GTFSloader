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

// eslint-disable-next-line no-unused-vars
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

// eslint-disable-next-line no-unused-vars
app.get('/export_gtfs', (req, res, next) => {
  gtfs.export(config)
      .then(() => {
        console.log('Export Successful');
        const agencykey = process.env.AGENCY;
        const agencydirectorypath = '/usr/src/app/gtfsloader/gtfs-export/'+ agencykey +'_gtfs' ;
        const agencyfilepath = agencydirectorypath + '/' + agencykey + '_gtfs.zip';
        zipper.sync.zip(agencydirectorypath).compress().save(agencyfilepath);
        res.download(agencyfilepath);
        return mongoose.connection.close();
      })
      .catch((err) => {
        console.error(err);
        res.send({ message: 'Export failed' });
      });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


