const sha1 = require('sha1')
const util = require('./utils/wxUtil.js')
const JWT = require('jsonwebtoken')
const jwtConfig = require('../config/jwtConfig')
const wxConfig = require('../config/wx.js')
const {
  getDwz
} = require('./utils/util')
const TokenService = require('../service/TokenService')

class wxController {

  static async replyGet(ctx, next) {
    const {
      signature,
      timestamp,
      nonce,
      echostr,
      openid
    } = ctx.query
    console.log( ctx.query)

    const token = wxConfig.token
    let str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    ctx.body=sha
    if (sha === signature) {
      console.log(echostr);
      ctx.body = echostr
    } else {
      console.log('next');
      await next()
    }
  }
  //微信回复
  static async reply(ctx, next) {
    const {
      signature,
      timestamp,
      nonce,
      echostr,
      openid
    } = ctx.query


    const token = wxConfig.token
    let str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    console.log('object :', sha);
    if (signature) {
      if (ctx.method === 'GET') {
        if (sha === signature) {
          console.log(echostr);
          ctx.body = echostr
        } else {
          console.log('next');
          await next()
        }
      } else if (ctx.method === 'POST' && ctx.is('text/xml')) {
        console.log('POST');
        if (sha !== signature) {
          return (ctx.body = 'Failed111')
        }

        //获取 text/xml内容 buff 字节
        let promise = new Promise(function (resolve, reject) {
          let buf = ''
          ctx.req.setEncoding('utf8')
          ctx.req.on('data', (chunk) => {
            buf += chunk
          })
          ctx.req.on('end', () => {
            resolve(buf)
          })
        })

        const data = await promise


        // 解析xml  得到message对象
        const content = await util.parseXML(data)
        const message = util.formatMessage(content.xml)
        // `````````````````````````````````````
        //判断 消息类型。 回复 信息
        let reply = ''

        if (message.MsgType === 'text') {
          // let content = message.Content
          // reply = '这是文本回复:' + content
          // let searchData=  await crawler2345.searchByKey(content)
          // console.log('searchData',searchData);
          // const url_long = require('../config/config').host + '/collect?wd=' + encodeURIComponent(content)
          // reply = url_short
          const openidToken = {
            iss: jwtConfig.weixin.iss,
            openid
          };
          //serverConfig.jwtSecret; // 指定密钥，这是之后用来判断token合法性的标志
          const token = JWT.sign(openidToken, jwtConfig.weixin.secret, {
            expiresIn: jwtConfig.weixin.expiresIn
          })
          reply = token // await getDwz(`http://${ctx.request.header.host}?token=${token}`)
        } else if (message.MsgType === 'event') {
          if (message.Event === 'subscribe') {
            reply = '欢迎订阅,回复电视电影综艺节目的名字,就可以获得播放地址，免费收看' + ' ！'
          }
        }

        // 把 需要回复的文本  通过 模版 匹配xml 返回wx服务器
        const xml = util.tpl(reply, message)
        ctx.status = 200
        ctx.type = 'application/xml'
        ctx.body = xml
        console.log()
      }
    } else {
      next()
    }
  }
  //
  static async token(ctx, next) {
    ctx.body = await TokenService.fetchTicket()
  }
  static async getSDKSignature(ctx, next) {
    let url = ctx.request.header.referer
    url = decodeURIComponent(url)
    const ticketData = await TokenService.fetchTicket()
    const ticket = ticketData.ticket
    console.log(ticket)
    let params = util.sign(ticket, url)
    params.appId = wxConfig.appID
    ctx.body = {
      success: true,
      data: params
    }
  }
}

module.exports = wxController