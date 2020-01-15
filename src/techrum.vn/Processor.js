"use strict";
// @ts-check

const path = require("path");
const {writeFile} = require("fs").promises;

const { fetchAtom } = require("../common/fetchAtom");
const {Feed} = require('feed');
const simpleGit = require('simple-git/promise');
const cheerio = require('cheerio');
const {fetchHtml} = require('../common/fetch');

class Processor {
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
            if (hpErr != null) { console.error(e); break; }
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
            await this.pushToGitHub(xml, this.rssDir, this.atomFileName);
        } catch(e) {
            return [e, false];
        }

        return [null, true];
    }


    async pushToGitHub(xml, rssDir, atomFileName) {
        await writeFile(path.resolve(__dirname, rssDir, atomFileName), xml);

        const git = simpleGit(path.resolve(__dirname, rssDir));
        await git.add(atomFileName);
        await git.commit(`Update ${atomFileName}`);
        await git.push("origin", "master", {"--force-with-lease":null});
    }
}

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

module.exports = {
    default:Processor,
    Processor,
};

