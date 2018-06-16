const express = require('express')
const app = express() 
const mongoose = require('mongoose')
const bodyParsor = require('Body-parser')
const { Post,User } = require('./models')
const { authMiddleware } = require('./lib/auth')
const DataLoader = require('dataloader')
const { createUserLoader,createPostsByUserIdLoader } = require('./loaders')

const morgan = require('morgan')
// app.get('/hello', (req,res) => {
//     console.log(req)
//     res.send('hello nook')
//     //send ได้ครั้งเดียว
// })

const mockposts = [
    {title : 'title1' , content : 'content1' , tags : ['tag1']},
    {title : 'title2' , content : 'content2' , tags : ['tag1']},
    {title : 'title3' , content : 'content3' , tags : ['tag1','tag2']},
]

const logMiddleware = (req ,res ,next) => {
    console.log(req.url)
    next()
}

const postRoute = require('./routes/postRoute')

// graphql apollo-server
const {graphqlExpress , graphiqlExpress} = require('apollo-server-express')

//**[ require graphql ]
const graphqlHTTP = require('express-graphql')
const schema = require('./schema')

//call postRoute.js **[bodyParsor]**
app.use(bodyParsor.json())
app.use(bodyParsor.urlencoded({extended : true}))

app.use('/posts' ,postRoute)
app.use(morgan('dev'))

//start graphql apollo-server
// app.use('/graphql', graphqlExpress({
//     schema: schema,
//     context: {
//         user: { _id: 1 , username: 'test' }
//     }
// }))
app.use(authMiddleware)


app.use('/graphql', graphqlExpress((req, res) =>{
   
    return {
        schema: schema,
        context: {
            loaders:{
                userLoader : createUserLoader(),
                postsByUserIdLoader : createPostsByUserIdLoader()
            },
            user: req.user
        }
    }
}))

app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql'
}))
//end graphql apollo-server

app.get('/tags' , async (req,res) =>{
    const tags = await Post.distinct('tags')
    res.json(tags)
})

app.get('/tags/posts', async (req ,res) =>{    
    if(!req.query.tag){
        return res.sendStatus(400)
    }
})

app.get('/test', async (req,res) => {
   const post = await Post.create({
       title: 'title1',
       content: 'content',
       tags: ['tag1'] 
   })
   console.log(post)
   res.json(post)
 })
 

 app.get('/test2', async (req,res) => {
    const post = await Post.create(mockposts)
    console.log(post)
    res.json(post)
  })

app.get('/testuser', async (req,res) => {
    const user = await User.signup('user1' , 'password1')
    res.json(user)
})

app.post('/signup', async (req,res) => {
    const { username , password} = req.body
    if( !username || !password ){
        return res.sendStatus(400)
    }    
    try{
        const user = await User.signup(username , password)
        res.json({
            _id: user._id,
            username: user.username
        })    
      } catch (e){       
         if(e.name === 'DuplicateUser'){ // err.message.match
            return res.status(400).send(e.message)
         }
      }
})

app.post('/login' , async (req,res) => {
  const {username , password} = req.body
  const token = await User.createAccessToken(username,password)
  if(!token){
      return res.sendStatus(401)//Unauthorized
  } 
  return res.json({ token })
})

app.post('/me', authMiddleware,  (req,res) =>{
    //const token = req.headers.authorization || req.query.token
    // if (!token){
    //     return res.sendStatus(401)
    // }
    //const user = await User.getUserFromToken(token)
    if(!req.user) {
        return res.sendStatus(401)
    }
    res.json(req.user)
})

// //**[app.use graphql]
// app.use('/graphql', graphqlHTTP ({
//     schema : schema,
//     graphiql : true
// }))


app.listen(3000,()=> {
    console.log('listen on port 3000')
})