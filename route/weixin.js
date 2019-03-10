const Router = require('koa-router')
const router = new Router()
const wxController = require('../Controller/wxController')

router.get('/reply/', wxController.replyGet)
router.post('/reply/', wxController.reply)
router.all('/token/', wxController.token)
router.all('/s', async (c,n)=>{
  c.body='ssss'
})
module.exports = router

