import { createRequire } from "module";
const require = createRequire(import.meta.url);

import { resolve } from "path";
import fs from "fs";
const { writeFile } = fs.promises;

const simpleGit = require("simple-git/promise");

export async function pushToGitHub(xml, rssDir, atomFileName) {
    await writeFile(resolve(rssDir, atomFileName), xml);

    const git = simpleGit(resolve(rssDir));
    await git.add(atomFileName);
    await git.commit(`Update ${atomFileName}`);
    await git.push("origin", "master", {"--force-with-lease":null});
}

export function squash() {
    const git = simpleGit(resolve(rssDir));
    return git.reset(["--hard", "dev"])
}
