const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const postSchema = mongoose.Schema({
    title: String,
    content: String,
    tags: [String],
    authorId : ObjectId
},{ timestamp:true,versionKey:false })
//version false cut _v: 0 in data



postSchema.statics.createPost = async function(data ,user) {
    //console.log(data)
    //console.log(user)
    if(typeof user === "undefined"){
        const e = new Error(`undefined data user token`)
        e.name = 'empty token'
        throw e
    }      
    return this.create({
        title : data.title,
        content: data.content,
        tags : data.tags,
        authorId : user._id
    })

}



module.exports  = mongoose.model('Post',postSchema)

