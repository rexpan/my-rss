// @ts-check
import fs from "fs"; const { createWriteStream, accessSync } = fs;
import http from 'http';
import https from 'https';

export function downloadFile(url, fileName) {
    const http_ = url.startsWith("https") ? https : http;

    return new Promise(resolve => {
        try {
            accessSync(fileName);
            resolve([null]);
            return;
        } catch (e) {
            console.log("begin downloadFile", url, fileName);
        }

        const file = createWriteStream(fileName);
        const request = http_.get(url, (response) => { response.pipe(file); });
        request.on("error", (error) => { resolve([error]) });
        file.on("finish", () => { resolve([null]); });
        file.on("error", (error) => { resolve([error]); });
    });
}

