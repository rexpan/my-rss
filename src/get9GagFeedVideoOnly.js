// @ts-check
const cheerio = require("cheerio");
const { fetchAtom } = require("./fetchAtom");
const Feed = require('feed');

const feedUrl = "http://9gag-rss.com/api/rss/get?code=9GAGHot&format=1";

async function get9GagFeedVideoOnly() {
    const [error, xs, meta] = await fetchAtom(feedUrl);
    if (error != null) {
        return [error, null];
    }

    const items = xs.map(parseItem).filter(r => r.video != null);

    const feed = getFeed(items, meta);
    return [null, feed.atom1()];
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

module.exports = {
    get9GagFeedVideoOnly,
};

