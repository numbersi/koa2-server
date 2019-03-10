const mongoose = require('mongoose')

const Schema = mongoose.Schema

const BannerSchema = new Schema({
  title: {type: String},
  pic: {type: String, default: 'sss'},
  _id: String,
  create_at:{type:Date,default:new Date()},
}, {versionKey: false})

mongoose.model('Banner', BannerSchema, 'banner')
