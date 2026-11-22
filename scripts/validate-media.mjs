import fs from 'node:fs';
import path from 'node:path';

console.log('=== Validating Media Registry & Attribution ===');

const chaptersDir = path.resolve('content/chapters');
let errors = 0;
let mediaAssetsCount = 0;

if (fs.existsSync(chaptersDir)) {
  const dirs = fs.readdirSync(chaptersDir);
  for (const d of dirs) {
    const mediaFile = path.join(chaptersDir, d, 'media.json');
    if (fs.existsSync(mediaFile)) {
      try {
        const assets = JSON.parse(fs.readFileSync(mediaFile, 'utf-8'));
        if (Array.isArray(assets)) {
          for (const asset of assets) {
            mediaAssetsCount++;
            if (!asset.id || !asset.title || !asset.type || !asset.license || !asset.source || !asset.attribution) {
              console.error(`ERROR in ${d}/media.json: Asset "${asset.id || 'unknown'}" is missing required attribution fields (title, type, license, source, attribution).`);
              errors++;
            }

            // If it's a file path, verify it exists in public or content
            if (asset.path && !asset.path.startsWith('http')) {
              const publicPath = path.resolve('public', asset.path.replace(/^\//, ''));
              const localPath = path.resolve(chaptersDir, d, asset.path);
              if (!fs.existsSync(publicPath) && !fs.existsSync(localPath)) {
                console.warn(`WARNING in ${d}/media.json: File path does not exist on disk: ${asset.path}`);
              }
            }
          }
        }
      } catch (e) {
        console.error(`ERROR: Failed to parse ${mediaFile}: ${e.message}`);
        errors++;
      }
    }
  }
}

if (errors > 0) {
  console.error(`Media validation failed with ${errors} error(s).`);
  process.exit(1);
}

console.log(`Media validation PASSED: ${mediaAssetsCount} verified asset attribution records.`);

