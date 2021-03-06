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
    console.log(ctx.query)

    const token = wxConfig.token
    let str = [token, timestamp, nonce].sort().join('')
    const sha = sha1(str)
    ctx.body = sha
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
          console.log('data :', data);


          // 解析xml  得到message对象
          const content = await util.parseXML(data)
          const message = util.formatMessage(content.xml)
          // `````````````````````````````````````
          //判断 消息类型。 回复 信息
          let reply = ''

          if (message.MsgType === 'text') {
            let content = message.Content
            // reply = '这是文本回复:' + content
            // let searchData=  await crawler2345.searchByKey(content)
            // console.log('searchData',searchData);
            // const url_long = require('../config/config').host + '/collect?wd=' + encodeURIComponent(content)
            // reply = url_short

            let wd = ''
            if (content != '1') {
              wd = content
            }
            const openidToken = {
              iss: jwtConfig.weixin.iss,
              openid,
              wd
            };
            //serverConfig.jwtSecret; // 指定密钥，这是之后用来判断token合法性的标志
            const token = JWT.sign(openidToken, jwtConfig.weixin.secret, {
              expiresIn: jwtConfig.weixin.expiresIn
            })

            console.log('wd :', wd);

            reply = [{
              title: "首页",
              description: '首页搜索上万部电影韩剧美剧热门综艺，免费在线观看',
              url: `http://${ctx.request.header.host}/index?token=${token}`
            }]

            // reply = `${await getDwz(`http://${ctx.request.header.host}/index/login?token=${token}`)}   #*#如果第一次打开是空白页，请刷新一下`

            reply.unshift({
              title: "搜索页面--" + wd,
              description: '上万部电影韩剧美剧热门综艺，免费在线观看',
              url: `http://${ctx.request.header.host}/index/login?token=${token}`
            })


            // title: movie.title,
            // description: movie.summary,
            // picUrl: movie.poster.indexOf('http') > -1 ? movie.poster : (config.baseUrl + '/upload/' + movie.poster),
            // url: config.baseUrl + '/movie/' + movie._id
          } else if (message.MsgType === 'event') {
            if (message.Event === 'subscribe') {
              reply = `【回复任何信息 得到网站链接，进入搜索你想观看的视频】
                      此公众号采集了欧美中日韩等几万部电影电视剧，热门韩剧美剧综艺国产剧，且可以免费在线观看。`
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
    console.log(url)
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