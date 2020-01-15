"use strict";

const {default: fetch} = require('node-fetch');

const headers = {
    "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4027.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    // "Accept-Encoding": "gzip, deflate, br",
};

async function fetchHtml(method, url, body, options) {
    try {
        const res = await fetch(url, {
            method,
            body: body == null ? undefined : JSON.stringify(body),
            ...options,
            headers: {...headers, ...(options == null ? undefined : options.headers)}

        });

        if (!res.ok) {
            const resErr = new Error(res.statusText);
            try {
                const body = (await res.text());
                return [resErr, body];
            } catch (e) { console.error(e); return [resErr, ""] }
        }

        {
            try {
                const body = (await res.text());
                return [undefined, body];
            } catch (e) { return [e, ""] }
        }
    } catch (e) { return [e, ""] }
}

module.exports = ({
    fetchHtml
});
