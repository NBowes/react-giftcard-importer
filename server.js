const Koa = require('koa')
const next = require('next')
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth')
const dotenv = require('dotenv')
const {verifyRequest} = require('@shopify/koa-shopify-auth')
const session = require('koa-session')
require('isomorphic-fetch')
dotenv.config()

const port = parseInt(process.env.PORT,10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({dev})
const handle = app.getRequestHandler()

const {API_KEY, API_SECRET} = process.env

app.prepare().then(()=>{
  const server = new Koa()
  server.use(session(server))
  server.keys = [API_KEY]
  server.use(
    createShopifyAuth({
      apiKey: API_KEY,
      secret: API_SECRET,
      scopes: ['write_customers','write_gift_cards'],
      afterAuth(ctx) {
        const {shop, accessToken} = ctx.session
        ctx.redirect('/')
      }
    })
  )
  server.use(verifyRequest())
  server.use(async(ctx)=>{
    await handle(ctx.req, ctx.res)
    ctx.res = false
    ctx.res.status = 200
    return
  })
  server.listen(port, ()=>{
    console.log(`> Server running on http://localhost:${port}`)
  })
})

