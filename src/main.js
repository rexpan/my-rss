// @ts-check
const {writeFileSync, createWriteStream, accessSync} = require("fs");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");
const {fetchAtom} = require("./fetchAtom");
main();

async function main(){
    const [error, xs, meta] = await fetchAtom(`http://9gag-rss.com/api/rss/get?code=9GAGHot&format=1`);
    if (error != null) {
        console.error(error);
        return;
    }

    const items = xs.map(parseItem);
    writeFileSync("out.json", JSON.stringify({items, meta}, null, 2));

    for (let item of items) {
        if (item.video != null) {
            const video = `./media/${item.id}.mp4`;
            const [error] = await downloadFile(item.video, path.resolve(video));
            if (error) console.error(error);
            else item.video = video;
        } else {
            const img = `./media/${item.id}.jpg`;
            const [error] = await downloadFile(item.img, path.resolve(img));
            if (error) console.error(error);
            else item.img = img;
        }
    }
    writeFileSync("out.html",
        items.map(item => `
        <html>
        <head>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0-beta/css/bootstrap.min.css" integrity="sha384-/Y6pD6FV/Vv2HJnA6t+vslU6fwYXjCFtcEpHbNJ0lyAFsXTsjBbfaDjzALeQsN6M" crossorigin="anonymous">
        </head>
        <body>
        <div class="container">
            <div class="card mb-3"><div class="card-body">
                <h4 class="card-title"><a href="${item.link}">${item.title}</a></h4>
                <div>${item.video
                    ? `<video src="${item.video}"></video>`
                    : `<img src="${item.img}" class="img-fluid">`
                }</div>
            </div></div>
        </div>
        </body>
        </html>`).join(""));
}


function parseItem({title, description, guid, link}){
    const $ = cheerio.load(description);
    const img = $("img").attr("src");
    const video = $(`video source`).attr("src");
    const id = guid.replace("https://9gag.com/gag/", "");
    return (video != null
        ? { id, guid, title, link, video }
        : { id, guid, title, link, img   }
    );
}

const http = require('http');
const https = require('https');

function downloadFile(url, fileName){
    const http_ = url.startsWith("https") ? https : http;

    return new Promise(resolve => {
        try {
            accessSync(fileName);
            resolve([null]);
            return;
        } catch(e) {
            console.log("begin downloadFile", url, fileName);
        }

        const file = createWriteStream(fileName);
        const request = http_.get(url, function(response) {
            response.pipe(file);
        });
        request.on("error", function(error){ resolve([error]) })
        file.on("finish", function(){
            resolve([null]);
        });
        file.on("error", function(error){
            resolve([error]);
        });
    });
}
