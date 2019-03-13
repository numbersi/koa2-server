const mongoose = require('mongoose')
const VodModel = mongoose.model('Vod')
const BannerModel = mongoose.model('Banner')
const AdminModel = mongoose.model('Admin')
const bcrypt = require('bcrypt')
const CollectService = require('../service/CollectService')
const JWT = require('jsonwebtoken')
class apiController {
  static async getvod(ctx, next) {

    ctx.body = ctx.path
  }
  static async searchByWd(ctx, next) {
    const {
      wd
    } = ctx.query
    if (wd) {
      const vods = await VodModel.find({
        name: {
          $regex: eval(`/${wd}/ig`)
        }
      }).limit(199)
      ctx.body = {
        errCode: 0,
        data: vods,
        msg: 'success'
      }
    } else {
      ctx.body = {
        errCode: 1,
        // data: vods,
        msg: '缺少参数'
      }
    }
  }
  static async changeVodStatus(ctx) {
    const {
      _id,
      status
    } = ctx.query
    console.log(status)
    const r = await VodModel.findOneAndUpdate({
      _id
    }, {
      $set: {
        status
      }
    }, {
      new: true
    })

    ctx.body = r

  }
  static async getBanner(ctx, next) {

    ctx.body = await BannerModel.find({}).sort({
      'create_at': -1
    })
  }
  static async getVod(ctx, next) {
    const {
      _id
    } = ctx.params

    ctx.body = await VodModel.findById(_id)
  }
  static async addBanner(ctx, next) {
    console.log(ctx.request.body)
    const res = await BannerModel.create(ctx.request.body)
    ctx.body = res

  }
  static async login(ctx, next) {

    const data = ctx.request.body; // post过来的数据存在request.body里
    if ((await AdminModel.find()).length < 1) {
      bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(data.password, salt, (err, hash) => {
          if (err) throw err;
          AdminModel.create({
            username: data.username,
            password: hash
          })
          console.log(hash)
        })
      })
    }

    if (!data) {
      return {
        success: false,
        retDsc: '请输入用户名',
        ret: null
      }
    }
    const userInfo = await AdminModel.findOne({
      username: data.username
    }) // 数据库返回的数据
    console.log(userInfo)
    if (!userInfo) {
      ctx.body = {
        success: false,
        retDsc: '用户不存在',
        ret: null
      };
      return
    }
    console.log('' + data.password)
    if (!bcrypt.compareSync('123123', userInfo.password)) {
      ctx.body = {
        success: false,
        retDsc: '密码错误',
        ret: null
      };
      return
    }
    const userToken = {
      iss: "numbersi",
      name: userInfo.username,
      id: userInfo.id,
    };
    const secret = 'numbersiSrcret' //serverConfig.jwtSecret; // 指定密钥，这是之后用来判断token合法性的标志
    const token = JWT.sign(userToken, secret, {
      expiresIn: '1h'
    }) // 签发token
    ctx.body = {
      success: true,
      retDsc: '登陆成功',
      ret: {
        token,
      }
    }
  }
  static async collect(ctx, next) {
    const {
      wd
    } = ctx.query
    CollectService.searchByWd(wd)

  }
}

module.exports = apiController