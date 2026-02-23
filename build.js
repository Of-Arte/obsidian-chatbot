import esbuild from 'esbuild';
import fs from 'fs/promises';
import path from 'path';

const distDir = 'public';

// Get the API_KEY from the build environment, prioritizing GEMINI_API_KEY.
const { API_KEY, GEMINI_API_KEY } = process.env;
const effectiveKey = GEMINI_API_KEY || API_KEY;

// Validate that an API key is provided during the build process.
if (!effectiveKey) {
    console.error('Build failed: Neither GEMINI_API_KEY nor API_KEY environment variable is set.');
    console.error('Please provide a key: "GEMINI_API_KEY=your_key npm run build"');
    process.exit(1);
}

async function build() {
    try {
        console.log('Starting build...');

        // Ensure the public directory is clean before building
        await fs.rm(distDir, { recursive: true, force: true }).catch(() => { });
        await fs.mkdir(distDir, { recursive: true });
        console.log('Cleaned and created public directory.');

        // Bundle the application with esbuild
        await esbuild.build({
            entryPoints: ['index.tsx'],
            bundle: true,
            outfile: path.join(distDir, 'bundle.js'),
            minify: true,
            sourcemap: true,
            target: ['chrome90', 'firefox90', 'safari14', 'edge90'],
            define: {
                // This safely injects the validated API key into the client-side code.
                'process.env.API_KEY': JSON.stringify(effectiveKey),
                'process.env.GEMINI_API_KEY': JSON.stringify(effectiveKey)
            },
            loader: { '.tsx': 'tsx', '.ts': 'ts' }
        });
        console.log('JavaScript bundled successfully.');

        // Process index.html: remove old script/importmap tags and add the new bundle
        let indexHtml = await fs.readFile('index.html', 'utf8');
        indexHtml = indexHtml.replace(/<script async src="[^"]*es-module-shims[^"]*"><\/script>\s*/s, '');
        indexHtml = indexHtml.replace(/<script type="importmap">[\s\S]*?<\/script>\s*/s, '');
        indexHtml = indexHtml.replace(
            '<script type="module" src="/index.tsx"></script>',
            '<script type="module" src="/bundle.js"></script>'
        );
        await fs.writeFile(path.join(distDir, 'index.html'), indexHtml);
        console.log('Processed and copied index.html');

        // Copy remaining static files to the public directory
        const staticFiles = ['favicon.svg', 'manifest.json', 'sw.js'];
        for (const file of staticFiles) {
            await fs.copyFile(file, path.join(distDir, file));
            console.log(`Copied ${file}`);
        }

        console.log('Build finished successfully!');
    } catch (err) {
        console.error('Build failed:', err);
        process.exit(1);
    }
}

build();