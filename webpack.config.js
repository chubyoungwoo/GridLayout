const path = require('path')
const Webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  mode: process.env.NODE_ENV,
  entry: {
    gridLayout: './src/index.js'
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
    publicPath: '/',
    library: 'gridLayout',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      // JS loader
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        options: {
          formatter: require('eslint-formatter-pretty')
        },
        exclude: /node_modules/
      },
      // Vue loader
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'eslint-loader'
          }
        },
        exclude: /node_modules/
      },
      /* Style loaders

      - style-loader : 불러온 CSS 파일을 head의 style 태그에 적재
      - css-loader : CSS 파일을 불러온다.
      - sass-loader : SASS / SCSS 파일을 불러오고 컴파일하여 CSS로 결과를 리턴한다.
      - ExtractTextPlugin : CSS를 파일로 생성하여 import 한다.
      */
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {minimize: true}
            },
            {
              loader: 'sass-loader',
              options: {minimize: true}
            }
          ],
          fallback: 'style-loader'
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader',
              options: {minimize: true}
            }
          ],
          fallback: 'style-loader'
        })
      }
    ]
  },
  plugins: [
    new HtmlPlugin({
      filename: 'index.html',
      template: './src/index.html',
      inject: true
    }),
    new UglifyJsPlugin({
      test: /\.js($|\?)/i,
      uglifyOptions: {
        output: {
          comments: false,
          beautify: false
        },
        compress: true
      }
    }),
    new ExtractTextPlugin({
      filename: '[name].css'
    }),
    new Webpack.ProvidePlugin({
      '_': 'lodash',
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    })
  ],
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    alias: {
      'quasar': path.join(__dirname, 'src/plugins/quasar/quasar.mat.esm'),
      'jquery-ui': 'jquery-ui/ui',
      'gridstack': path.join(__dirname, 'src/layout/gridstack.js')
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9999
  },
  optimization: {
    minimize: true
  }
}