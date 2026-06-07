const HtmlWebpackPlugin = require('html-webpack-plugin')
const path = require('path')

module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production'

  return {
    entry: './src/index.tsx',

    output: {
      path: path.resolve(__dirname, 'build'),
      publicPath: '/static/',
      filename: 'bundle.js',
      clean: true,
    },

    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },

    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
      ],
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: './src/assets/index.html',
        favicon: 'src/assets/favicon.png',
        inject: true,
      }),
    ],

    devtool: isProduction ? 'source-map' : 'cheap-module-source-map',

    devServer: {
      static: {
        directory: path.join(__dirname, 'build'),
      },
      historyApiFallback: {
        index: '/static/',
      },
      port: 4999,
      hot: true,
    },
  }
}
