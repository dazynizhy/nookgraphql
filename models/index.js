const mongoose = require('mongoose')
const Post = require('./Post')
const User = require('./User')

mongoose.set('debug',true)
mongoose.connect('mongodb://192.168.21.98:27017/react_nook')


const db = mongoose.connection

db.once('open' , function(){
    console.log('connected to dev');

});

module.exports = {
    Post,User
}