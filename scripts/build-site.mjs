import { access, copyFile, cp, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const site = fileURLToPath(new URL('../', import.meta.url));
const output = join(site, 'dist');
const playground = join(site, 'coding', 'dist');

// Fail before replacing the output if the playground has not been built.
await access(join(playground, 'index.html'));
const pages = (await readdir(site, { withFileTypes: true }))
  .filter(entry => entry.isFile() && entry.name.endsWith('.html'));

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
// Existing SteamTube games are self-contained HTML files; keep their URLs.
for (const page of pages) {
  await copyFile(join(site, page.name), join(output, page.name));
}
await cp(playground, join(output, 'coding'), { recursive: true });
console.log(`Built ${pages.length} SteamTube pages and MonkeyScript at dist/coding/.`);
