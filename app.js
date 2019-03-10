const Koa = require('koa')
const app = new Koa()
const Router = require('koa-router')
const router = new Router()
const fs = require('fs')
const koaBody = require('koa-body');
const jwtKoa = require('koa-jwt')
const view = require('koa-view');
const path = require('path')
const static = require('koa-static')
var staticCache = require('koa-static-cache')
const jwtConfig = require('./config/jwtConfig')
const logger = require('koa-logger')
app.use(logger({
  // transporter: (str, args) => {
  //   console.log(str)
  //   console.log(args)
  // }
}))

app.use(view(path.join(__dirname + '\\public')));
app.use(static(path.join(__dirname + '\\public')))

app.use(staticCache(path.join(__dirname, 'public'), {
  maxAge: 365 * 24 * 60 * 60
}))

app.use(koaBody({
  multipart: true, // 支持文件上传
  // encoding: 'gzip',
  formidable: {
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 2 * 1024 * 1024, // 文件上传大小
    onFileBegin: (name, file) => { // 文件上传前的设置
    },
  }
}));
const {
  connect,
  initSchemas
} = require('./db/init');
(async () => {
  initSchemas()
  connect()
})()
app.use(async (ctx, next) => {
  if (ctx.path === '/__webpack_hmr/client') {
    return
  }
  await ctx.render('index')
  await next()
})



// 其他页面通过 router 加载
let routes = fs.readdirSync(`${__dirname}/route`)
routes.forEach((element) => {
  let route = require(`${__dirname}/route/${element}`)
  console.log(element)
  /*
      urls 下面的每个文件负责一个特定的功能，分开管理
      通过 fs.readdirSync 读取 urls 目录下的所有文件名，挂载到 router 上面
    */
  let index = element.replace('.js', '')

  if (jwtConfig[index] && jwtConfig[index].status) {
    console.log(jwtConfig[index].status)
    router.use('/' + index,
      jwtKoa({
        secret: jwtConfig[index].secret
      })
      .unless({
        path: jwtConfig[index].unlessPath //数组中的路径不需要通过jwt验证
      }),
      route.routes(), route.allowedMethods())
  } else {

      router.use('/' + index, route.routes(), route.allowedMethods())
  }


})

app.use(router.routes())

app.listen(3000, () => {
  console.log('连接成功')
})