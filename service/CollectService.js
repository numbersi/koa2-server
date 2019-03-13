const basUrl = 'https://www.66s.cc'
const search = '/e/search/index.php'
const request = require('request-promise')
class CollectService {

  static async searchByWd(wd) {
    console.log('searchByWd,res')

    try {
      const res = await request.post(basUrl + search).form({
        keyboard: wd,
        tbname: 'article',
        tempid: 1,
        show: 'title',
        mid: 1
      })
    } catch (error) {
      const res  = await request.get(basUrl+'/e/search/'+error.response.headers.location) 
      //解析
      console.log(res)

      // .mainleft

    }

  }

}

module.exports = CollectService