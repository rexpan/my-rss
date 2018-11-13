const request = require("request");

module.exports = ({
    request: requestP
});

function requestP(url) {
    return new Promise(resolve => {
        request(url, function (error, response, body) {
            resolve([error, response, body]);
        });
    });
}
