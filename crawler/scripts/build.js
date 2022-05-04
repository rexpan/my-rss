import { build } from 'esbuild';

try {
    await build({
        entryPoints: [
            'src/main.js',
        ],
        outdir: 'dist',
        platform: 'node',
        bundle: true,
        format: 'esm',
        // keepNames: true,
        legalComments: 'none',
        minify: true,
        external: [
            // dynamic require
            ...('undici feedparser simple-git'.split(' ')),
        ],
    });
} catch(err) {

    process.exit(1);
}

