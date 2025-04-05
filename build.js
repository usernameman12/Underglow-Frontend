const fs = require('fs');
const path = require('path');

console.log('Building for deployment...');

const vercelDir = path.join(__dirname, '.vercel');
if (!fs.existsSync(vercelDir)) {
  fs.mkdirSync(vercelDir, { recursive: true });
}

const outputDir = path.join(__dirname, 'out');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function copyFiles(sourceDir, targetDir, excludes = []) {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    if (excludes.includes(file)) continue;

    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    const stat = fs.statSync(sourcePath);

    if (stat.isDirectory()) {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }
      copyFiles(sourcePath, targetPath, excludes);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${sourcePath} to ${targetPath}`);
    }
  }
}

copyFiles(__dirname, outputDir, ['.git', 'node_modules', 'out', '.vercel', 'build.js']);

console.log('Build complete! Files are ready for deployment.');