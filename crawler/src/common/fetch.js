// @ts-check
import { createRequire } from "module";

import fetch from "node-fetch";
import FeedParser from "feedparser";

const headers = {
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4027.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    // "Accept-Encoding": "gzip, deflate, br",
};

async function _fetch(method, url, body, options) {
    try {
        const res = await fetch(url, {
            method,
            body: body == null ? undefined : JSON.stringify(body),
            ...options,
            headers: {...headers, ...(options == null ? undefined : options.headers)}
        });

        return [undefined, res];
    } catch (e) { return [e, undefined] }
}

export async function fetchHtml(method, url, body, options) {
    const [e, res] = await _fetch(method, url, body, options);
    if (e) return [e, ""];

    if (!res.ok) {
        const resErr = new Error(res.statusText);
        try {
            const body = (await res.text());
            return [resErr, body];
        } catch (e) { console.error(e); return [resErr, ""] }
    }

    try {
        const body = (await res.text());
        return [undefined, body];
    } catch (e) { return [e, ""] }
}

export async function fetchAtom(url) {
    const [err, res] = await _fetch("GET", url);
    if (err) return [err, [], {}];

    if (!res.ok) {
        const resErr = new Error(res.statusText);
        try {
            const body = (await res.text());
            resErr.body = body;
        } catch (e) { console.error(e); }
        return [resErr, [], {}];
    }

    return new Promise((resolve) => {
        const feedparser = new FeedParser({});
        feedparser.on('error', (error) => {
            resolve([error, [], {}])
        });

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
            resolve([undefined, items, meta]);
        });

        res.body.pipe(feedparser);
    });
}

