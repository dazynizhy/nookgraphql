const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const postSchema = mongoose.Schema({
    title: String,
    content: String,
    tags: [String],
    authorId : ObjectId
},{ timestamp:true,versionKey:false })
//version false cut _v: 0 in data

module.exports  = mongoose.model('Post',postSchema)

