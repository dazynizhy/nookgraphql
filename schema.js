const { Post,User } = require('./models')

const {makeExecutableSchema} = require('graphql-tools')
const fs = require('fs')
const path = require('path')

//console.log(path.join(__dirname, 'graphql' , 'typedefs.graphql'));
const typeDefsPath  = path.join(__dirname, 'graphql' , 'typedefs.graphql')
const typeDefs = fs.readFileSync(typeDefsPath).toString()
const resolvers = require('./graphql/resolvers')

// const typeDefs =`
// type Query {
//     hello: String
// }
// `

module.exports = makeExecutableSchema({
    typeDefs: typeDefs,
    resolvers: resolvers    
})