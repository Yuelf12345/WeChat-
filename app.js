const Koa = require('koa')
const Router = require('koa-router')
const { koaBody } = require('koa-body')

const axios = require("axios");
const app = new Koa()
const router = new Router()
let grant_type = 'client_credentials'
let API_Key = 'hzMp0ANHpn0j6IjlUlZmxTRe'
let Secret_Key = 'g8WHYcMWMel9j1Ya0FjTLB2aLHcFfOor'
let access_token = '24.b5eccff911b90188e7fb542aff02725e.2592000.1702738990.282335-43142011'
let URL_1 = 'https://aip.baidubce.com/oauth/2.0/token'
let URL_2 = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions'
app.use(koaBody({
    multipart: true
}))
router.get('/', (ctx) => {
    ctx.body = "后台"
})
router.get('/test', async (ctx) => {
    const res = await axios.post(
        `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_Key}&client_secret=${Secret_Key}`
    );
    access_token = res.data.access_token
    console.log('access_token', access_token);
    let messages = []
    messages.push({ role: "user", content: '你好啊' })
    const res2 = await axios.post(
        URL_2,
        { messages: messages },
        { params: { access_token } }
    );
    const { data } = res2;
    console.log(data);
    if (data.error_code) {
        ctx.body = data.error_msg
    }
})
router.post('/test', (ctx) => {
    ctx.body = "post测试"
})
app.use(router.routes())
app.listen(7071, () => {
    console.log('服务器已启动,请访问http://localhost:7071/');
})


// API Key:hzMp0ANHpn0j6IjlUlZmxTRe
// Secret Key:g8WHYcMWMel9j1Ya0FjTLB2aLHcFfOor