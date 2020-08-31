import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

import { Processor as P1 } from "./techrum.vn/Processor.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rssDir = resolve(__dirname, "../../rss/");
const sleepTime = 2 * 60 * 1000;

main();
async function main(){
    const ps = [
        P1,
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
