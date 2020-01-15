"use strict";

const {default: fetch} = require('node-fetch');

async function fetchHtml(method, url, body, options) {
    try {
        const res = await fetch(url, {
            method,
            body: body == null ? undefined : JSON.stringify(body),
            ...options,
        });

        if (!res.ok) {
            const resErr = new Error(res.statusText);
            try {
                const body = res.size < 1 ? "" : (await res.text())
                return [resErr, body];
            } catch (e) { return [resErr, ""] }
        }

        {
            const body = res.size < 1 ? "" : (await res.text());
            return [undefined, body];
        }
    } catch (e) { return [e, ""] }
}

module.exports = ({
    fetchHtml
});
