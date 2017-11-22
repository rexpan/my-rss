// @ts-check

const path = require("path");
const { promisify } = require('util');
const { writeFile, writeFileSync, createWriteStream, accessSync } = require("fs");
const writeFileAsync = promisify(writeFile);

const cheerio = require("cheerio");

const { fetchAtom } = require("./fetchAtom");
const Feed = require('feed');
const simpleGit = require('simple-git/promise');

const feedUrl = "http://9gag-rss.com/api/rss/get?code=9GAGHot&format=1";

class Processor {
    constructor(options) {
        this.tItem        = {};
        this.items        = [];
        this.feedUrl      = "";
        this.rssDir       = "";
        this.atomFileName = "";

        Object.assign(this, options);
    }

    async start() {
        const [error, items, meta] = await get9GagFeedVideoOnly(this.feedUrl);
        if (error != null) {
            return [error, false];
        }

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

async function get9GagFeedVideoOnly(feedUrl) {
    const [error, xs, meta] = await fetchAtom(feedUrl);
    if (error != null) {
        return [error, null, null];
    }

    const items = xs.map(parseItem).filter(r => r.video != null);
    return [null, items, meta];
}

function parseItem(item) {
    const { title, description, guid, link } = item;
    const $ = cheerio.load(description);
    const img = $("img").attr("src");
    const video = $(`video source`).attr("src");
    const id = guid.replace("https://9gag.com/gag/", "");
    return (video != null
        ? { ...item, id, video }
        : { ...item, id, img }
    );
}

function getFeed(items, meta) {
    const feed = new Feed(meta);
    items.forEach(({ id, video, img, ...post }) => feed.addItem(post));
    return feed;
}

async function pushToGitHub(xml, rssDir, atomFileName) {
    await writeFileAsync(path.resolve(__dirname, rssDir, atomFileName), xml);

    const git = simpleGit(path.resolve(__dirname, rssDir));
    await git.add("9GAGHotVideoOnly.atom");
    await git.commit(`Update 9GAGHotVideoOnly.atom`);
    await git.push(["origin", "master", "--force-with-lease"]);
}

module.exports = {
    default:Processor,
    Processor,
};

