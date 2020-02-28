"use strict";
// @ts-check
const cheerio = require("cheerio");
const { Feed } = require("feed");
const { fetchAtom } = require("../common/fetch");
const { pushToGitHub } = require("../common/git");

class Processor {
    constructor(options) {
        this.tItem        = {};
        this.items        = [];
        this.feedUrl      = "https://bbs.feng.com/forum.php?mod=rss&fid=22&auth=d7f0JqsskTdwmUWNfEmY0jGhaQeV0Ym5yaQkJ0SdQtIJqwCE%2FtcyIgGINgTttoCpWQ";
        this.rssDir       = "";
        this.atomFileName = "bbs.feng.com_fid_22.atom";

        Object.assign(this, options);
    }

    async start() {
        const [error, items, meta] = await getOrigFeed(this.feedUrl);
        if (error != null) return [error, false];

        const newItems = items.filter(item  => this.tItem[item.id] == null);
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
        } catch(e) {
            return [e, false];
        }

        return [null, true];
    }
}

async function getOrigFeed(feedUrl) {
    const [error, xs, meta] = await fetchAtom(feedUrl);
    if (error != null) {
        return [error, null, null];
    }

    const items = xs.map(parseItem).filter(Boolean);
    return [null, items, meta];
}

// 网络小说 有声小说 集 册
const whiteList0 = "网络小说".toLowerCase().split(" ");
const whiteList = "epub 小说 电子书 新修版 精制版".toLowerCase().split(" ");
const blackList = "画传 心理学 百科全书".toLowerCase().split(" ");

function parseItem(item) {
    const { title, description } = item;
    const text = `${title}\n${description}`.toLowerCase();
    const isWhiteList = whiteList.some(keyword => text.includes(keyword));
    const isBlackList = blackList.some(keyword => text.includes(keyword));
    return (isWhiteList && !isBlackList) ? item : null;
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

