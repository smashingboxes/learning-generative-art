const express = require('express');
const app = express();
const config = {
  PORT: 3333
}
app.use(express.static('public'));
app.listen(config.PORT, () => {
  console.log(`App listening on port ${config.PORT}!`);
});
app.get('/test', function (req, res) {

});


var webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(3000, 'localhost', function (err, result) {
  if (err) {
    return console.log(err);
  }

  console.log('Listening at http://localhost:3000/');
});
