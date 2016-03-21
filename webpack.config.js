module.exports = {
  entry: './src/js/entry.js',
  devtool: 'inline-source-map',
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.css$/, 
        loader: 'style!css'
      },
      {
        test: /\.js$/, 
        loader: 'babel', 
        query: {
          presets: ['react', 'es2015']
        }, 
        exclude: /node_modules/
      }
    ]
  }
}
