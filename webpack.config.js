const path = require('path')
const Webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  mode: 'development',
  // entry: 웹팩이 파일을 읽어들이기 시작하는 부분. Gridstack과 Gridstack.jQueryUI 모듈을 layout.js로 통합한다.
  entry: {
    layout: './src/index.js'
  },
  // output: 웹팩의 빌드 결과를 출력하는 부분.
  output: {
    path: path.resolve(__dirname, './dist'),      // 파일의 출력 경로
    filename: '[name].js',                        // 출력파일 경로
    publicPath: '/'                               // 웹서버에 위치할 경로
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
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader']
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
    new Webpack.ProvidePlugin({
      '_': 'lodash',
      '$': 'jquery',
      'jQuery': 'jquery',
      'window.jQuery': 'jquery'
    }),
    new ExtractTextPlugin({
      filename: 'style/[name].css'
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
    minimize: false
  }
}