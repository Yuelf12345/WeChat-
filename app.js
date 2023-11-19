const Koa = require('koa')
const Router = require('koa-router')
// const { koaBody } = require('koa-body')
const xmlParser = require('koa-xml-body');
const axios = require("axios");
const crypto = require('crypto');
const sha1 = (str) => {
    let shasum = crypto.createHash("sha1");
    return shasum.update(str, 'utf-8').digest("hex");
}

const app = new Koa()
const router = new Router()
// huany
app.use(xmlParser())

let grant_type = 'client_credentials'
let API_Key = 'hzMp0ANHpn0j6IjlUlZmxTRe'
let Secret_Key = 'g8WHYcMWMel9j1Ya0FjTLB2aLHcFfOor'
let access_token;
let URL_1 = 'https://aip.baidubce.com/oauth/2.0/token'
let URL_2 = 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions'

router.get('/', (ctx) => {
    ctx.body = "后台"
})
router.get('/test', (ctx) => {
    const { signature, echostr, timestamp, nonce } = ctx.query;
    let token = 'yue'
    let str = [token, timestamp, nonce].sort().join("");
    let sha1Str = sha1(str);
    if (sha1Str === signature) {
        ctx.body = echostr;
    }
    else {
        ctx.body = "wrong";
    }
})

const getAccessToken = async () => {
    const res_Token = await axios.post(
        `${URL_1}?grant_type=${grant_type}&client_id=${API_Key}&client_secret=${Secret_Key}`
    );
    access_token = res_Token.data.access_token
    return
}

setInterval(async () => {
    await getAccessToken()
}, (7200 - 300) * 1000);

router.post('/test', async (ctx) => {
    const xml = ctx.request.body;
    console.log('xml', xml)
    const createTime = Date.parse(new Date());
    const msgType = xml.xml.MsgType[0];
    const toUserName = xml.xml.ToUserName[0];
    const toFromName = xml.xml.FromUserName[0];
    const event = xml.xml.Event ? xml.xml.Event[0] : '';
    const content = xml.xml.Content
    if (msgType == 'event' && event == 'subscribe') {
        ctx.body = `<xml>
		 <ToUserName><![CDATA[${toFromName}]]></ToUserName>
		 <FromUserName><![CDATA[${toUserName}]]></FromUserName>
		 <CreateTime>${createTime}</CreateTime>
		 <MsgType><![CDATA[text]]></MsgType>
		 <Content><![CDATA[欢迎~]]></Content>
         </xml>`;
    } else {//其他情况
        try {
            console.log('access_token', access_token);
            let messages = []
            messages.push({ role: "user", content: content })
            const res_Data = await axios.post(
                URL_2,
                { messages: messages },
                { params: { access_token } }
            );
            const { data } = res_Data;
            console.log('data', data)
            let res
            if (data.error_code) {
                res = data.error_msg
                ctx.body = `<xml>
            <ToUserName><![CDATA[${toFromName}]]></ToUserName>
            <FromUserName><![CDATA[${toUserName}]]></FromUserName>
            <CreateTime>${createTime}</CreateTime>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[-${content}-, ${res}-已达到开放api每日请求限制....,明天再想办法白嫖一个]]></Content>
            </xml>`;
            } else {
                res = data.result
                ctx.body = `<xml>
            <ToUserName><![CDATA[${toFromName}]]></ToUserName>
            <FromUserName><![CDATA[${toUserName}]]></FromUserName>
            <CreateTime>${createTime}</CreateTime>
            <MsgType><![CDATA[text]]></MsgType>
            <Content><![CDATA[${res}]]></Content>
            </xml>`;
            }
        } catch (error) {
            console.log(error)
        }
    }
})
app.use(router.routes())
app.listen(7071, () => {
    console.log('服务器已启动,请访问http://localhost:7071/');
})