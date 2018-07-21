const { Post,User } = require('../models')
const DataLoader = require('dataloader')

const { PubSub , withFilter } = require('graphql-subscriptions')
const pubsub = new PubSub()
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
        author: async (post , args ,context) =>{
            //const user = await User.findById(post.authorId)
            const user = await context.loaders.userLoader.load(`${post.authorId}`)//post.authorId
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
        posts: async  (user , args ,context) =>{
            //const posts = await Post.find({ authorId: user._id })
            const posts = await context.loaders.postsByUserIdLoader.load(user._id)//user._id
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
        },
        hello: () =>{
            pubsub.publish
            ('HELLO_QUERIED')
            return 'Hello World'
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

            pubsub.publish('POST_CREATED',{
                id: res.id,
                tags: res.tags
            })

            return res
        },
        // createPost : 
        // args.data.
       
    },
    Subscription: {
        helloQueried: {
            subscribe: () => {
                return pubsub.asyncIterator
                ('HELLO_QUERIED')
            },
            resolve: () => {
                return `${new Date()}`
            }
        },
        postCreated : {
            // subscribe: () => {
            //     return pubsub.asyncIterator
            //     ('POST_CREATED')
            // },
            subscribe: withFilter(() => pubsub.asyncIterator('POST_CREATED')
            , (payload, args) => {
                if(!args.tag) {
                    return true
                }
                return payload.tags.includes(args.tag)
            }),
            resolve: async (payload) => {
                const post = await Post.findById(payload.id)
                return post 
            }
        }
    }
}


module.exports = resolvers