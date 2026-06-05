import fs from 'fs';
import path from 'path';

const frontendDir = path.join(process.cwd(), 'frontend', 'src');

function replaceInFile(filePath, searchStr, replaceStr) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(searchStr)) {
      content = content.replace(new RegExp(searchStr, 'g'), replaceStr);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      replaceInFile(filePath, 'Feast', 'CF Company');
    }
  });
}

console.log('Replacing "Feast" with "CF Company" in all frontend files...');
walkDirectory(frontendDir);
console.log('Done!');
