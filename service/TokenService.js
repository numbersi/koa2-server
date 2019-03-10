const wxConfig = require('../config/wx.js')
const mongoose = require('mongoose')
const request = require('request-promise')

const Token = mongoose.model('Token')
const Ticket = mongoose.model('Ticket')
const base = 'https://api.weixin.qq.com/cgi-bin/'

const api = {
  accessToken: base + 'token?grant_type=client_credential',
  ticket: {
    get: base + 'ticket/getticket?'
  }
}
class TokenService {

  static async request(options) {
    options = Object.assign({}, options, {
      json: true
    })

    try {
      const response = await request(options)
      return response
    } catch (error) {
      console.error(error)
    }
  }
  static async getAccessToken() {
    const res = await Token.getAccessToken()
    return res
  }
  static async saveAccessToken(data) {
    const res = await Token.saveAccessToken(data)

    return res
  }

  //  获取TOken
  static async fetchAccessToken() {
    let data = await this.getAccessToken()
    if (!this.isValidToken(data, 'access_token')) {
      data = await this.updateAccessToken()
      this.saveAccessToken(data)
    }
    console.log('获取有效token', data);

    return data.access_token
  }
  // 更新Token
  static async updateAccessToken() {
    const url = api.accessToken + `&appid=${wxConfig.appID}&secret=${wxConfig.appSecret}`

    const data = await this.request({
      url: url
    })

    console.log(data)
    const now = new Date().getTime()
    const expiresIn = now + (data.expires_in - 20) * 1000
    data.expires_in = expiresIn
    console.log(data);
    return data
  }
  // 判断Token 有效
  static isValidToken(data, name) {
    if (!data || !data[name] || !data.expires_in) {
      console.log('无效');

      return false
    }

    const expiresIn = data.expires_in
    const now = (new Date().getTime())

    if (now < expiresIn) {
      console.log('有效');
      return true

    } else {
      console.log('无效');
      return false
    }
  }


  static async fetchTicket() {
    let data = await this.getTicket()

    if (!this.isValidToken(data, 'ticket')) {
      let token = await this.fetchAccessToken()
      console.error("saveTicket+++++++++++++++++",token)
      data = await this.updateTicket(token)
      await this.saveTicket(data)
    }


    return data
  }

  static async getTicket() {
    const res = await Ticket.getTicket()

    return res
  }
  static async saveTicket(data) {
    const res = await Ticket.saveTicket(data)

    return res
  }
  static async updateTicket(token) {
    const url = api.ticket.get + '&access_token=' + token + '&type=jsapi'

    let data = await this.request({
      url: url
    })
    console.log(data);

    const now = (new Date().getTime())
    const expiresIn = now + (data.expires_in - 20) * 1000

    data.expires_in = expiresIn

    return data
  }

  sign(t, url) {
    return sign(t, url)
  }
}
module.exports = TokenService