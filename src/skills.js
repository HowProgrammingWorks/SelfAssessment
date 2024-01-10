'use strict';

const PARSING_TIMEOUT = 1000;
const EXECUTION_TIMEOUT = 5000;

const fs = require('node:fs').promises;
const concolor = require('concolor');

const curDir = process.cwd();
const dir = `${curDir}/Skills`;
let exitCode = 0;

const loadFile = async (file) => {
  const fileName = dir + '/' + file;
  const data = await fs.readFile(fileName, 'utf8');
  return data;
};

const countLines = (s) => {
  let count = 1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\n') count++;
  }
  return count;
};

const analise = async (section) => {
  const file = `${section}.md`;
  const md = await loadFile(file);
  const lines = countLines(md);
  console.log(concolor.info(`Lines: ${lines}`));
};

(async () => {
  console.log(concolor.white('Software engineering self assessment'));
  console.log(concolor.info('Auto Checker'));
  const files = await fs.readdir(dir);
  const sections = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.substring(0, file.length - '.md'.length));
  for (const section of sections) {
    console.log(concolor`\nCheck: ${section}(b,white)`);
    await analise(section);
  }
  console.log('');
  process.exit(exitCode);
})();
