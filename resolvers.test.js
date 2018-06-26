const resolvers = require('./resolvers')


describe('Query', () => {
    describe('posts' () =>{
        it('return all posts', async () =>{
            const context = {
                models: {
                    Post: {
                        find: test.fn(async () => {
                          
                        })
                    }
                }
            }
        })
    })
})