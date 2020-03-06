const path = require("path");
const {writeFile} = require("fs").promises;
const simpleGit = require('simple-git/promise');

module.exports = {
    pushToGitHub,
    squash
};

async function pushToGitHub(xml, rssDir, atomFileName) {
    await writeFile(path.resolve(__dirname, rssDir, atomFileName), xml);

    const git = simpleGit(path.resolve(__dirname, rssDir));
    await git.add(atomFileName);
    await git.commit(`Update ${atomFileName}`);
    await git.push("origin", "master", {"--force-with-lease":null});
}

function squash() {
    const git = simpleGit(path.resolve(__dirname, rssDir));
    return git.reset(["--hard", "dev"])
}
