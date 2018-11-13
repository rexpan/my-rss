const FeedParser = require('feedparser');
const request = require('request'); // for fetching the feed

module.exports = ({
    fetchAtom
});

const headers = {
    'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    // "Accept-Encoding": "gzip, deflate, br",
};

function fetchAtom(url) {
    return new Promise((resolve) => {
        const req = request.get({url, headers})
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
