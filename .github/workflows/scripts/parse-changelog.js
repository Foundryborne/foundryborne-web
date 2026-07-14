const fs = require('fs');
const path = require('path');

const filePath = path.resolve(process.cwd(), 'changelog.html');
if (!fs.existsSync(filePath)) {
  console.error(`Error: ${filePath} does not exist.`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');

const summaryRegex = /<summary>\s*<strong>v([\d\.]+)<\/strong>/i;
const match = content.match(summaryRegex);
if (!match) {
  console.error("Could not find latest version in changelog.html summary.");
  process.exit(1);
}

const latestVersion = match[1];
console.log(`Latest Version found: ${latestVersion}`);

let versionSection = "";

const h3Id = `v${latestVersion}`;
// Match from after the closing </h3> tag of this h3 up to the next <h3 or </details>
const h3Regex = new RegExp(`<h3 id="${h3Id}"[\\s\\S]*?>[\\s\\S]*?<\\/h3>([\\s\\S]*?)(?=<h3|<\\/details>)`, 'i');
const h3Match = content.match(h3Regex);

if (h3Match) {
  versionSection = h3Match[1];
} else {
  // It's the main release. Let's find the first details block content up to the first h3
  const detailsRegex = /<details id="v[^"]+"[^>]*>([\s\S]*?)(?=<h3)/i;
  const detailsMatch = content.match(detailsRegex);
  if (detailsMatch) {
    versionSection = detailsMatch[1];
  }
}

if (!versionSection) {
  console.error(`Could not extract section for version ${latestVersion}`);
  process.exit(1);
}

let markdown = `**Daggerheart v${latestVersion} Release**\n\n`;
let currentText = versionSection;

// Replace headers
currentText = currentText.replace(/<h4>(.*?)<\/h4>/gi, '\n**$1**\n');
currentText = currentText.replace(/<h3>(.*?)<\/h3>/gi, '\n**$1**\n');
// Replace <li> tags
currentText = currentText.replace(/<li>([\s\S]*?)<\/li>/gi, (match, p1) => {
  return `• ${p1.trim().replace(/\s+/g, ' ')}\n`;
});
// Replace paragraphs
currentText = currentText.replace(/<p>([\s\S]*?)<\/p>/gi, '\n$1\n');
currentText = currentText.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');
currentText = currentText.replace(/<em>(.*?)<\/em>/gi, '*$1*');
currentText = currentText.replace(/<a [^>]*>(.*?)<\/a>/gi, '$1');
currentText = currentText.replace(/<br\s*\/?>/gi, '\n');

// Clean up remaining HTML tags
currentText = currentText.replace(/<[^>]+>/g, '');

// Clean up whitespace line-by-line
currentText = currentText.split('\n')
  .map(line => line.trim())
  .filter(line => line.length > 0)
  .join('\n');

// Add double spacing before main section headers
currentText = currentText.replace(/(\*\*(?:Bugfixes|Features|SRD Compendiums)\*\*)/gi, '\n$1');

markdown += currentText.trim();

console.log("=== Parsed Changelog ===");
console.log(markdown);
console.log("========================");

fs.writeFileSync(path.resolve(process.cwd(), 'changelog_parsed.txt'), markdown);
