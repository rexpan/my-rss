// @ts-check
const path = require("path");

const simpleGit = require('simple-git/promise');

// const { Processor:P1 } = require("./9gag/Processor");
const { Processor:P2 } = require("./udemycoupon.learnviral.com/Processor");
// const { Processor:P3 } = require("./bbs.feng.com/Processor");

const rssDir = path.resolve(__dirname, "../rss/");
const sleepTime = 2 * 60 * 1000;

main();
async function main(){
    console.log("begin squash");
    await squash();
    console.log("end squash\n");

    const ps = [
        // P1,
        P2,
        // P3,
    ].map(Processor => new Processor({ rssDir }));

    let i = 0;
    while (true) {
        console.info("begin process %d (%s)", i, new Date());
        for (const p of ps) {
            const [err, updated] = await p.start();
            if (err != null) { console.error(p.feedUrl, err); continue; }
        }
        console.info("end process %d", i);

        i++;

        await sleep(sleepTime);
    }
}

async function sleep(n){
    return new Promise(resolve => setTimeout(() => resolve(), n));
}

function squash() {
    const git = simpleGit(path.resolve(__dirname, rssDir));
    return git.reset(["--hard", "src"])
}
