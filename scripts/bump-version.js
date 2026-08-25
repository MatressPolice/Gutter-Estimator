import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.resolve(__dirname, '../version.json');
const tsFilePath = path.resolve(__dirname, '../src/version.ts');

let version = '1.01';
let buildTime = new Date().toISOString();

// 1. Calculate version dynamically from Git commit history
try {
  const countStr = execSync('git rev-list --count HEAD', { encoding: 'utf8' }).trim();
  const commitCount = parseInt(countStr, 10);
  if (!isNaN(commitCount) && commitCount > 0) {
    const majorOffset = Math.floor(commitCount / 100);
    const minor = commitCount % 100;
    const major = 1 + majorOffset;
    version = `${major}.${minor.toString().padStart(2, '0')}`;
  }
} catch (e) {
  // Fallback if git is not initialized or in isolated environment
  if (fs.existsSync(versionFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      if (data.version) version = data.version;
    } catch {}
  }
}

// 2. Fetch the commit date/time stamp
try {
  const commitDate = execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim();
  if (commitDate) {
    buildTime = commitDate;
  }
} catch (e) {
  // Fallback to existing or current timestamp
  if (fs.existsSync(versionFilePath)) {
    try {
      const data = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
      if (data.buildTime) buildTime = data.buildTime;
    } catch {}
  }
}

// 3. Write outputs
fs.writeFileSync(
  versionFilePath,
  JSON.stringify({ version, buildTime }, null, 2) + '\n',
  'utf8'
);

const tsContent = `// Auto-generated build metadata. Do not edit directly.
export const APP_VERSION = '${version}';
export const BUILD_TIMESTAMP = '${buildTime}';
`;

fs.writeFileSync(tsFilePath, tsContent, 'utf8');

console.log(`[Version Manager] App Version: v${version} | Build Date/Time: ${buildTime}`);
