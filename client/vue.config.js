module.exports = {
  devServer: {
    historyApiFallback : true,
    host: process.env.HOSTNAME_CLIENT,
    port: process.env.PORT_CLIENT
  },
  pluginOptions: {
    quasar: {
      importStrategy: 'manual',
      rtlSupport: false
    }
  },
  transpileDependencies: [
    'quasar'
  ]
}