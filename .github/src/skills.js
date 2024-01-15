'use strict';

const fs = require('node:fs').promises;
const path = require('node:path');
const cp = require('node:child_process');
const metautil = require('metautil');
const concolor = require('concolor');

const TITLE = 'Software engineering self assessment';
const PARSING_TIMEOUT = 1000;
const EXECUTION_TIMEOUT = 5000;

const PATH = path.join(process.cwd(), '../..');

const OUT = cp.execSync('git config --get remote.origin.url').toString();
const REPO = metautil.between(OUT, ':', '.');
const LINK = 'https://github.com/' + REPO;

const BASE = 'https://img.shields.io/badge/Self_Assessment-skills-009933';
const STYLE = `style=flat-square`;
const BADGE = `[![Skills](${BASE}?${STYLE})](${LINK})`;

const codeBlock = (code) => '```\n' + code + '\n```';

const loadFile = async (file) => {
  const fileName = path.join(PATH, file);
  const data = await fs.readFile(fileName, 'utf8');
  return data;
};

const LEVEL = [
  'heard',
  'known',
  'used',
  'explained',
  'talked',
  'researched',
  'constructed',
];

const EMOJI = ['👂', '🎓', '🖐️', '🙋', '📢', '🔬', '🚀'];

const LEVEL_EMOJI = Object.fromEntries(LEVEL.map((name, i) => [name, EMOJI[i]]));

console.log({ LEVEL, EMOJI, LEVEL_EMOJI });

const countLines = (s) => {
  let count = 1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\n') count++;
  }
  return count;
};

const analise = async (section) => {
  const md = await loadFile(`Skills/${section}.md`);
  const lines = countLines(md);
  console.log(concolor.info(`Lines: ${lines}`));
  return ;
};

(async () => {
  console.log(concolor.white(TITLE));
  console.log(concolor.info('Auto Checker'));

  const files = await fs.readdir(`${PATH}/Skills/`);
  const sections = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.substring(0, file.length - '.md'.length));
  for (const section of sections) {
    console.log(concolor`\nCheck: ${section}(b,white)`);
    await analise(section);
  }

  const badgeCode = codeBlock(BADGE);

  const report = `## ${TITLE}\n\n${BADGE}\n\n${badgeCode}\n`;
  await fs.writeFile(`${PATH}/Profile/REPORT.md`, report);

  const readme = await loadFile('.github/src/Templates/README.md');
  const newReadme = readme.replace('$BADGE', BADGE);
  await fs.writeFile(`${PATH}/README.md`, newReadme);

  console.log('');
  process.exit(0);
})();
