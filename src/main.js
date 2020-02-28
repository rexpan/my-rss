"use strict";

const path = require("path");

const { Processor:P1 } = require("./techrum.vn/Processor");
const { Processor:P2 } = require("./udemycoupon.learnviral.com/Processor");

const rssDir = path.resolve(__dirname, "../rss/");
const sleepTime = 2 * 60 * 1000;

main();
async function main(){
    const ps = [
        P1,
        P2,
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
