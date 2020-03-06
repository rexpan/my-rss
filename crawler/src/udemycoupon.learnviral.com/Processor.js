// @ts-check
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const cheerio = require("cheerio");
const { Feed } = require("feed");

import { fetchAtom, fetchHtml } from "../common/fetch.js";
import { pushToGitHub } from "../common/git.js";

export class Processor {
    constructor(options) {
        this.tItem = {};
        this.items = [];
        this.feedUrl = "https://udemycoupon.learnviral.com/coupon-category/free100-discount/feed/";
        this.rssDir = "";
        this.atomFileName = "udemycoupon.learnviral.com_free100-discount.atom";

        Object.assign(this, options);
    }

    async start() {
        const [error, items, meta] = await getOrigFeed(this.feedUrl);
        if (error != null) return [error, false];

        const newItems = items.filter(item => this.tItem[item.id] == null);
        items.forEach(item => {
            if (this.tItem[item.id] == null)
                this.tItem[item.id] = item;
            else
                Object.assign(this.tItem[item.id], item);
        });

        if (newItems.length < 1) {
            return [null, false];
        }

        this.items = this.items.concat(newItems);

        const feed = getFeed(this.items, meta);
        const xml = feed.atom1();

        try {
            await pushToGitHub(xml, this.rssDir, this.atomFileName);
        } catch (e) {
            return [e, false];
        }

        return [null, true];
    }
}
export default Processor;

async function getOrigFeed(feedUrl) {
    const [error, xs, meta] = await fetchAtom(feedUrl);
    if (error != null) {
        return [error, null, null];
    }

    const items = (await Promise.all(xs.map(parseItem))).filter(Boolean);
    return [null, items, meta];
}

async function parseItem(item) {
    const { link } = item;

    const [rErr, rBody] = await fetchHtml("GET", link);
    if (rErr != null) return item;

    try {
        const $ = cheerio.load(rBody);
        const href = $(`a.coupon-code-link`).attr("href");
        const url = new URL(href);
        if (!url.search) return null;
        return ({ ...item, link: href });
    } catch (e) {
        console.error(link, e);
        return item;
    }
}

function getFeed(items, meta) {
    const feed = new Feed(meta);
    items.forEach(({ id, video, img, ...post }) => feed.addItem(post));
    return feed;
}
