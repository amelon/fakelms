const { join } = require('path')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: join(__dirname, 'lib', 'fakelms.js'),
  output: {
    libraryTarget: 'umd',
    library: 'FakeLms',
    path: __dirname,
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: { cacheDirectory: true },
        },
      },
    ],
  },
}
