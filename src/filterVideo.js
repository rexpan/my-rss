// @ts-check
const path = require("path");

const simpleGit = require('simple-git/promise');

const { Processor } = require("./Processor");

const nSquash = 100;
const rssDir = "../rss/";
const sleepTime = 2 * 60 * 1000;

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
        console.info("begin process %d (%s)", i, new Date());
        const [err, updated] = await p.start();

        if (err != null) console.error(err);
        else if (updated) ++i;

        console.info("end process %d", i);

        await sleep(sleepTime);

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
