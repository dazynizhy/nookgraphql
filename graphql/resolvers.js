const { Post,User } = require('../models')
const DataLoader = require('dataloader')

const userLoader = new DataLoader( async (keys)=>{
    const rows = await User.find({
        _id:{ $in : keys}
    })
    const results = keys.map((key) => {
        // return rows.find((row) =>{
        //     //console.log('row._id', row._id.toString(), typeof row._id )
        //     //console.log(key)
        //     return row._id.toString() === key
        // })
        const matchRow = rows.find((row) => {
            return `${row._id}` === `${key}`
        })
        return matchRow
    })
    console.log(rows)
    console.log(results.map(user => user.username))
    return results

},{
    cacheKeyFn: (key) => `${key}`
})

const postsByUserIdLoader = new DataLoader( async (userIds) =>{
    const rows = await Post.find({
        authorId: { $in : userIds}
    })
    const results = userIds.map((userId) => {
        const matchRow = rows.filter((row) => {
            return `${row.authorId}` === `${userId}`
        })
        return matchRow
    })
    return results
   
},{ cacheKeyFn: (key) => `${key}`})

// const resolvers = {   
//     Post: {
//         id: post => post._id,
//         author:  (post) =>  User.findById(post.authorId)
//     },
//     User: {
//         id: user => user._id,
//         posts: (user) => Post.find({ authorId: user._id })
//     },
//     Query:{
//         posts:  () => Post.find(),
//         post: (obj,{id}) => Post.findOne({_id : args.id}),
//         users: () => User.find() ,
//     }
// }

const resolvers = { 
    Tag:{
        posts: async (tag) =>{
            const posts = await Post.find({ tags : tag.name })
            return posts
        }
    },  
    Post: {
        id: (post) => { return post._id},
        author: async (post) =>{
            //const user = await User.findById(post.authorId)
            const user = await userLoader.load(`${post.authorId}`)//post.authorId
            return user
        },
        tags: (post) => {
            return post.tags.map((tag) =>{
                return { name:tag }
            })
        } 
    },
    User: {
        id: (user) => { return user._id },
        posts: async (user) =>{
            //const posts = await Post.find({ authorId: user._id })
            const posts = await postsByUserIdLoader.load(user._id)//user._id
            return posts
        }
    },
    Query:{
        posts: async (obj, {tag , tags} ) => {
            if(tags) {
                const post = await Post.find({tags : { $in : tags }})
                return post
            }
            if(tag) { 
                const post = await Post.find({tags : tag})
                return post
            }

            const post = await Post.find()
            return post
        } ,
        post: async (obj,{id}) =>{
            const post = await Post.findOne({_id : id})
            return post
        },
        users: async () => {
            const users = await User.find()
            return users
        } ,
        me: async (obj, args, context) => {
            return context.user
        }
    },
    Mutation: {
        login: async (obj , { username, password}) =>{
            const token = await User.createAccessToken(username, password)
            return token
        },
        signup: async (obj , { username, password}) =>{
            const user = await User.signup(username, password)
            return user
        },
        createPost: async(obj , { data } ,context) =>{
            //const res = context.user
            const res = await Post.createPost( data ,context.user)
            //console.log(res)
            return res
        }
        // createPost : 
        // args.data.
    }
}


module.exports = resolvers