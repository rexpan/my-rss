// @ts-check
const {writeFileSync, createWriteStream, accessSync} = require("fs");
const path = require("path");
const request = require("request");
const cheerio = require("cheerio");

const Feed = require('feed');
const simpleGit = require('simple-git');

const { get9GagFeedVideoOnly } = require("./get9GagFeedVideoOnly");
const rssDir = "../rss/";
const atomFileName = "9GAGHotVideoOnly.atom";
const nSquash = 1000;

main();
async function main(){
    console.log("begin squash");
    squash();
    console.log("end squash\n");

    let i = 0;
    while (true) {
        console.log("begin process", i);
        await process();
        console.log("end process", i);
        console.log();

        await sleep(2*60*1000);
        ++i;

        if (i > nSquash) {
            console.log("begin squash");
            squash();
            console.log("end squash\n");
            i = 0;
        }
    }
}

async function sleep(n){
    return new Promise(resolve => setTimeout(() => resolve(), n));
}

async function process(){
    console.log("begin get9GagFeedVideoOnly");
    const [error, xml] = await get9GagFeedVideoOnly();
    if (error != null) {
        console.error(error);
        return;
    }
    console.log("end get9GagFeedVideoOnly");

    console.log("begin pushToGitHub");
    pushToGitHub(xml);
    console.log("end pushToGitHub");
}

function pushToGitHub(xml){
    writeFileSync(path.resolve(__dirname, rssDir, atomFileName), xml);

    const git = simpleGit(path.resolve(__dirname, rssDir));
    git.add("9GAGHotVideoOnly.atom");
    git.commit(`Update 9GAGHotVideoOnly.atom`);
    git.push(["origin", "master", "--force-with-lease"]);
}

function squash() {
    const git = simpleGit(path.resolve(__dirname, rssDir));
    git.reset(["--hard", "src"])
}

