const Router = require('koa-router')
const router = new Router()
const apiController = require('../Controller/apiController')
const wxController = require('../Controller/wxController')
// router.get('/getvod', apiController.getvod)
router.get('/searchByWd', apiController.searchByWd)
router.get('/changeVodStatus', apiController.changeVodStatus)
router.get('/banner', apiController.getBanner)
router.post('/addBanner', apiController.addBanner)
router.post('/login', apiController.login)
router.get('/vod/:_id', apiController.getVod)
// 异步处理网页的签名
router.post('/signature', wxController.getSDKSignature)

module.exports = router
