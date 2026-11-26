import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Get list of all files in content/ from git at 1f0636b
const gitFilesRaw = execSync('git ls-tree -r --name-only 1f0636b content/', { encoding: 'utf8' });
const gitFiles = gitFilesRaw.trim().split('\n').map((f) => f.trim()).filter(Boolean);

console.log('Total content files in 1f0636b:', gitFiles.length);

const missingFiles = [];
const truncatedFiles = [];
const modifiedFiles = [];

for (const relPath of gitFiles) {
  if (!fs.existsSync(relPath)) {
    missingFiles.push(relPath);
    continue;
  }
  const localContent = fs.readFileSync(relPath);
  const gitContent = execSync(`git show 1f0636b:"${relPath}"`);
  
  if (localContent.length < gitContent.length * 0.7 && gitContent.length > 200) {
    truncatedFiles.push({
      path: relPath,
      gitSize: gitContent.length,
      localSize: localContent.length,
    });
  } else if (!localContent.equals(gitContent)) {
    modifiedFiles.push({
      path: relPath,
      gitSize: gitContent.length,
      localSize: localContent.length,
    });
  }
}

console.log('\n=== COMPARISON WITH RELEASE 1f0636b ===');
console.log('Missing files from 1f0636b:', missingFiles.length, missingFiles);
console.log('Truncated files (<70% of git size):', truncatedFiles.length, truncatedFiles);
console.log('Modified files count:', modifiedFiles.length);
if (modifiedFiles.length > 0) {
  console.log('Modified files list:');
  modifiedFiles.forEach((m) => console.log(` - ${m.path} (git: ${m.gitSize}b, local: ${m.localSize}b)`));
}
