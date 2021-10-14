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
        target: 'node17.5.0',
        // keepNames: true,
        legalComments: 'none',
        minify: true,
        external: [
            // native
            'pg-native',
            // dynamic require
            ...('undici dotenv feedparser @kwsites/file-exists debug'.split(' ')),
        ],
    });
} catch(err) {
    process.exit(1);
}

