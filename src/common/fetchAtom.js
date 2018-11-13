const FeedParser = require('feedparser');
const request = require('request'); // for fetching the feed

module.exports = ({
    fetchAtom
});

function fetchAtom(url) {
    return new Promise((resolve) => {
        const req = request(url)
        const feedparser = new FeedParser({});

        req.on('error', (error) => resolve([error, null, null]));

        req.on('response', function (res) {
            const stream = this; // `this` is `req`, which is a stream

            if (res.statusCode !== 200) {
                this.emit('error', new Error('Bad status code'));
            } else {
                stream.pipe(feedparser);
            }
        });

        feedparser.on('error', (error) => resolve([error, null, null]));

        const items = [];
        let meta;

        feedparser.on('readable', function () {
            // This is where the action is!
            const stream = this; // `this` is `feedparser`, which is a stream
            meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance

            let item;
            while (item = stream.read()) {
                items.push(item);
            }
        });

        feedparser.on('end', function () {
            resolve([null, items, meta]);
        });
    });
}
