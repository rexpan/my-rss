// @ts-check
import cheerio from "cheerio";
import { Feed } from "feed";

import { fetchAtom, fetchHtml } from "../common/fetch.js";
import { pushToGitHub } from "../common/git.js";

export class Processor {
    tItem         = new Map();
    items         = [];
    feedUrl       = "https://www.techrum.vn/forums/-/index.rss";
    homePageUrl   = "https://www.techrum.vn/";
    rssDir        = "";
    atomFileName  = "techrum.vn.atom";
    homePageGuids = new Set();

    constructor(options) {
        Object.assign(this, options);
    }

    async start() {
        const [error, items, meta] = await getOrigFeed(this.feedUrl);
        if (error != null) return [error, false];

        do {
            const [hpErr, hpHtml] = await fetchHtml("GET", this.homePageUrl);
            if (hpErr != null) { console.error(hpErr); break; }
            try {
                const $ = cheerio.load(hpHtml);
                const hpGuids = $(`.porta-article-item .block-header a`).map((i, a) => `https://www.techrum.vn${a.attribs.href}`).toArray();
                for (const hpGuid of hpGuids) this.homePageGuids.add(hpGuid);
            } catch (e) { console.error(e); }
        } while(false);

        const newItems = items.filter(item => !this.tItem.has(item.guid) && this.homePageGuids.has(item.guid));
        this.items = this.items.concat(newItems);
        for (const item of newItems) this.tItem.set(item.guid, item);

        if (newItems.length < 1) {
            return [null, false];
        }

        const feed = getFeed(this.items, meta);
        const xml = feed.atom1();

        try {
            await pushToGitHub(xml, this.rssDir, this.atomFileName);
        } catch(e) {
            return [e, false];
        }

        return [null, true];
    }
}
export default Processor;

async function getOrigFeed(feedUrl) {
    const [error, items, meta] = await fetchAtom(feedUrl);
    if (error != null) return [error, [], null];
    return [undefined, items, meta];
}

function getFeed(items, meta) {
    const feed = new Feed(meta);
    items.forEach(({ id, video, img, ...post }) => feed.addItem(post));
    return feed;
}
