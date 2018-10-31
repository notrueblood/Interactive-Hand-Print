module.exports = [
  {
    name: 'client-side',
    entry: ['babel-polyfill', './client/src/main.js'],
    devtool: 'source-map',
    output: {
      path: __dirname,
      filename: 'client/build/app.js',
    },
    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules)/,
          loader: 'babel-loader',
          query: {
            presets: ['env', 'stage-0'],
          },
        },
      ],
    },
  },
];
