// @ts-check
const Koa = require('koa');
const http = require('http');
const https = require('https');

const get9GagFeedVideoOnly = require('./get9GagFeedVideoOnly');

get9GagFeedVideoOnly();

const app = new Koa();

// x-response-time
app.use(calc_X_Response_Time);
// app.use(calc_logger);

app.use(async ctx => {
    ctx.body = 'Hello World';
});

http.createServer(app.callback()).listen(80);
https.createServer(app.callback()).listen(443);

async function calc_X_Response_Time(ctx, next){
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
}

// async function calc_logger(ctx, next) {
//     const start = Date.now();
//     await next();
//     const ms = Date.now() - start;
//     console.log(`${ctx.method} ${ctx.url} - ${ms}`);
// }
