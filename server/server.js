const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3333;
const PUBLIC = __dirname + '/../dist';

app.use(bodyParser.json());
app.use( '/', express.static( PUBLIC ) );

app.get('/', function (req, res) {
  res.sendFile(`${PUBLIC}/index.html`);
});
app.post('/memory', function (req, res) {

});

app.listen(PORT, function () {
  console.log(`Example app listening on port ${PORT}!`);
});
