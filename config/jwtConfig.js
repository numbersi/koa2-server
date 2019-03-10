module.exports = {
  api: {
    secret: "numbersiSrcret",
    iss:"numbersi",
    unlessPath: [/^\/api\/[login,banner,searchByWd]/,],
    expiresIn:'2d',
    status:false
  },
  weixin: {
    secret: "weixin-numbersi",
    iss:"numbersi",
    unlessPath: [],
    expiresIn:'2d',
    status:false
  }
}