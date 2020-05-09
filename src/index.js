const mongoose = require('mongoose');
const express = require('express');
const gtfs = require('gtfs');
const config = require('../gtfs/config.json');
const zipper = require('zip-local');
const sanitize = require('sanitize-filename');
const Promise = require('bluebird');
const fs = require('fs');

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
        res.send({message: 'Import Successful'});
      })
      .catch((err) => {
        console.error(err);
        res.send({message: 'Import failed'});
      });
});

// eslint-disable-next-line no-unused-vars
app.get('/export_gtfs', (req, res, next) => {
  gtfs.export(config)
      .then(async () => {
        const gtfsdatapath = '/usr/src/app/gtfsloader/gtfs-export/';
        console.log('Starting GTFS zipping for ${agencyCount} agency(ies)');

        await Promise.mapSeries(config.agencies, (agency) => {
          if (!agency.agency_key) {
            throw new Error('No Agency Key provided.');
          }

          const agencykey = sanitize(agency.agency_key);
          zipper.sync.zip(gtfsdatapath + agencykey)
              .compress()
              .save('/usr/src/app/download/' + agencykey + '.zip');
        });
        console.log('Export Successful');
        res.send({message: 'Export Successful'});
      })
      .catch((err) => {
        console.error(err);
        res.send({message: 'Export failed'});
      });
});

// eslint-disable-next-line no-unused-vars
app.get('/validate_gtfs', (req, res, next) => {
  const gtfsdatapath = '/usr/src/app/gtfsloader/gtfs-export/';

  if (!req.query.agency) {
    res.send({message: 'Export failed: No Agency Key provided'});
  } else if (!fs.existsSync(gtfsdatapath + req.query.agency)) {
    res.send({message:
      'Export failed: Agency must be exported before validated.'});
  } else {
    console.log(`Starting GTFS validation for ${req.query.agency} agency`);

    let gtfsvalidated = false;

    for (const agency of config.agencies) {
      console.log(agency.agency_key);
      if (req.query.agency == agency.agency_key) {
        const agencykey = sanitize(agency.agency_key);
        const {spawn} = require('child_process');
        const pyProg = spawn('feedvalidator.py',
            ['--output=CONSOLE',
              gtfsdatapath + agencykey]);

        pyProg.stdout.on('data', function(data) {
          console.log(JSON.stringify(data.toString()));
          console.log('Validation Successful');
        });
        gtfsvalidated = true;
        break;
      }
    }
    if (!gtfsvalidated) {
      res.send({message:
        'Export failed: GTFS for agency specified not found.'});
    } else {
      res.sendFile('validation-results.html',
          {root: '/usr/src/app/gtfsloader/'});
    }
  }
});

// eslint-disable-next-line no-unused-vars
app.get('/download_gtfs', (req, res, next) => {
  if (!req.query.agency) {
    res.send({message: 'Download failed: No Agency Key provided'});
  } else if (fs.existsSync('/usr/src/app/download/'+
                            req.query.agency + '.zip')) {
    console.log('Starting GTFS download for ' + req.query.agency + 'agency');
    res.download('/usr/src/app/download/' + req.query.agency + '.zip');
  } else {
    res.send({message:
      'Download failed: Agency must be exported before downloaded.'});
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


