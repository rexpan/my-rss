// @ts-check
const {writeFileSync, createWriteStream, accessSync} = require("fs");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");

const Feed = require('feed');
const simpleGit = require('simple-git/promise');

const { Processor } = require("./Processor");

const nSquash = 1000;
const rssDir = "../rss/";

main();
async function main(){
    console.log("begin squash");
    await squash();
    console.log("end squash\n");

    const p = new Processor({
        feedUrl     : "http://9gag-rss.com/api/rss/get?code=9GAGHot&format=1",
        atomFileName: "9GAGHotVideoOnly.atom",
        rssDir,
    });

    let i = 0;
    while (true) {
        console.log("begin process", i);
        const [err, updated] = await p.start();
        console.log("end process", i);
        console.log();

        await sleep(2*60*1000);

        if (err == null && updated) {
            ++i;
        }

        if (i > nSquash) {
            console.log("begin squash");
            await squash();
            console.log("end squash\n");
            i = 0;
        }
    }
}

async function sleep(n){
    return new Promise(resolve => setTimeout(() => resolve(), n));
}

function squash() {
    const git = simpleGit(path.resolve(__dirname, rssDir));
    return git.reset(["--hard", "src"])
}
