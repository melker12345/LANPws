const path = require('path');

module.exports = {
  entry: './src/main.js',  // Entry point for your application
  output: {
    filename: 'bundle.js',  // The bundled output file
    path: path.resolve(__dirname, 'dist'),  // Output directory
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.css$/i,  // Load CSS files
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
