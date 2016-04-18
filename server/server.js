const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const PORT = 3333;
const PUBLIC = __dirname + '/../dist';
const PUBLIC_BRAIN = __dirname + '/../brain';

app.use(bodyParser.json({limit: '50mb'}));
app.use('/', express.static( PUBLIC ));

app.use('/brain', express.static( PUBLIC_BRAIN, {
    setHeaders: function (res, path, stat) {
      //res.headers = res.headers || {};
      res.set('Access-Control-Allow-Origin', '*');
    }
  }));

app.use('/memory', function(req, res, next) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', function (req, res) {
  res.sendFile(`${PUBLIC}/index.html`);
});
app.post('/memory', function (req, res) {
  console.log(res._headers);
  fs.writeFile('brain/brain.json', JSON.stringify(req.body), (err) => {
    if (err) throw err;
    console.log('It\'s saved!');
  });
  res.send(req.body);
});

app.listen(PORT, function () {
  console.log(`Machine Learning server listening on ${PORT}!`);
});
