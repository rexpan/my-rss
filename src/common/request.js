const request = require("request");

module.exports = ({
    request: requestP,
    getAsBrowser,
});

function requestP(url) {
    return new Promise(resolve => {
        request(url, function (error, response, body) {
            resolve([error, response, body]);
        });
    });
}

const headers = {
    'User-Agent':"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    // "Accept-Encoding": "gzip, deflate, br",
};

function getAsBrowser(url){
    return requestP({url, headers});
}
