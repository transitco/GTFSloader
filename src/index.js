const mongoose = require('mongoose');
const express = require('express');
const gtfs = require('gtfs');
const config = require('../gtfs/config.json');
const zipper = require('zip-local');
const sanitize = require('sanitize-filename');
const Promise = require('bluebird');

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
      })
      .catch((err) => {
        console.error(err);
        res.send({ message: 'Import failed' });
      });
});

// eslint-disable-next-line no-unused-vars
app.get('/export_gtfs', (req, res, next) => {
  gtfs.export(config)
      .then(async () => {
        console.log("here");
        const gtfsdatapath = '/usr/src/app/gtfsloader/gtfs-export/';

        //const agencykey0 = process.env.AGENCY;
        const agencyCount = config.agencies.length;
        console.log(`Starting GTFS zip creation for ${agencyCount} agency(ies)`);
        
        await Promise.mapSeries(config.agencies, agency => {
          if (!agency.agency_key) {
            throw new Error('No Agency Key provided.');
          }

        const agencykey = sanitize(agency.agency_key);
        const agencydirectorypath = gtfsdatapath + agencykey;
        const zipfilepath = gtfsdatapath + '/download/' + agencykey + '.zip';
        zipper.sync.zip(agencydirectorypath).compress().save(zipfilepath);
        });

        zipper.sync.zip(gtfsdatapath + 'download/').compress().save(gtfsdatapath  + 'download/exported_gtfs.zip');
        console.log('Export Successful');
        res.download(gtfsdatapath + 'download/exported_gtfs.zip');
        
          
      })
      .catch((err) => {
        console.error(err);
        res.send({ message: 'Export failed' });
      });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});


