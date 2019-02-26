const ip = require('ip')
const opn = require('opn')
const chalk = require('chalk')
const express = require('express')
const history = require('connect-history-api-fallback')
const proxyMiddleware = require('http-proxy-middleware')
const path = require('path')

const proxyTable = {
  '/portal_proxy': {
    target: 'http://yfk.scofcom.gov.cn',
    changeOrigin: true
  }
}

const app = express()
const port = 3000
const publicPath = '/face'
const distServerPath = path.join(__dirname, 'face')
const uri = `http://${ip.address()}:${port}${publicPath}`

app.use(publicPath, express.static(distServerPath))

app.use(history({
  index: `${publicPath}index.html`
}))

app.listen(port, error => {
  if (error) {
    throw error
  }
  console.log(chalk.green(`Server is running at ${uri}`))
  process.env.npm_config_opn && opn(uri)
})

Object.keys(proxyTable).forEach(context => {
  let options = proxyTable[context]
  if (typeof options === 'string') {
    options = { target: options }
  }
  options.onProxyReq = (proxyReq, req, res) => {
    console.log(`[${chalk.gray('proxy')}]: ${chalk.yellow(proxyReq.path)}`)
  }
  app.use(proxyMiddleware(options.filter || context, options))
})

app.use(require('connect-livereload')())
