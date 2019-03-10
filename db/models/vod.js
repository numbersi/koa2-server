const mongoose = require('mongoose')

const Schema = mongoose.Schema
const VodSchema = new Schema({
  _id: {type: String, unique: true},
  name: String,
  type: String,
  pic: String,
  lang: String,
  area: String,
  last: {type: Date, default: Date.now()},
  year: String,
  state: String,
  note: String,
  actor: String,
  director: String,
  playList: String,
  des: String,
  status:{type:Boolean,default:true}
}, {versionKey: false})

mongoose.model('Vod', VodSchema, 'vods')
