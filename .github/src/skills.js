'use strict';

const fs = require('node:fs').promises;
const path = require('node:path');
const cp = require('node:child_process');
const metautil = require('metautil');
const concolor = require('concolor');

const caption = concolor('b,white');
const fatal = concolor('b,white/red');
const fixup = concolor('b,black/yellow');

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

let exitCode = 0;

const wrongFormat = (msg, file) => {
  exitCode = 1;
  console.log(fatal` Wrong file format: ${msg} `);
  console.log(fatal` File: ${file} `);
};

const warnFixup = (msg, file) => {
  console.log(fixup` Fixup file format: ${msg} `);
  console.log(fixup` File: ${file} `);
};

const codeBlock = (code) => '```\n' + code + '\n```';

const loadFile = async (filePath) => {
  const fileName = path.basename(filePath);
  const data = await fs.readFile(filePath, 'utf8');
  if (data.includes('\r')) {
    warnFixup('expected LF linebreaks, not CRLF or CR', fileName);
  }
  if (!data.startsWith('## ')) {
    wrongFormat('no markdown «## Heading»', fileName);
  }
  if (!data.endsWith('\n')) {
    warnFixup('no newline at the end of file', fileName);
  }
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
const SYMBOLS = ['~', '+', '*', '!'];

const LEVEL_EMOJI = Object.fromEntries(LEVEL.map((n, i) => [n, EMOJI[i]]));
const EMOJI_LEVEL = Object.fromEntries(EMOJI.map((n, i) => [n, LEVEL[i]]));

const removeColon = (line) => {
  const s = line.trim();
  if (!s.endsWith(':')) return s;
  return s.substring(0, s.length - 1).trim();
};

const useSymbol = (s) => {
  for (const symbol of SYMBOLS) {
    if (s.endsWith(symbol)) {
      const emoji = EMOJI[SYMBOLS.indexOf(symbol)];
      return s.substring(0, s.length - 1) + emoji;
    }
  }
  return s;
};

const formatSkill = (line) => {
  let skill = removeColon(line.substring(1).trim());
  skill = useSymbol(skill);
  let icon = '';
  let name = '';
  for (const emoji of EMOJI) {
    const pos = skill.indexOf(emoji);
    if (pos === -1) continue;
    icon = emoji;
    name = skill.substring(pos + emoji.length, skill.length).trim();
    skill = skill.substring(0, pos);
    break;
  }
  if (!icon) {
    for (const level of LEVEL) {
      if (!skill.endsWith(' ' + level)) continue;
      name = level;
      skill = skill.substring(0, skill.length - level.length);
      break;
    }
  }
  skill = removeColon(skill);
  if (icon && !name) name = EMOJI_LEVEL[icon];
  if (name && !icon) icon = LEVEL_EMOJI[name];
  let level = (icon + ' ' + name).trim();
  if (icon && name && LEVEL_EMOJI[name] !== icon) level = undefined;
  return { skill, level };
};

const getSkills = (data, file, options) => {
  const lines = data.split('\n');
  if (lines.at(-1).trim() === '') lines.pop();
  let section = '';
  let empty = 0;
  const sections = {};
  const skills = new Set();
  const out = [];
  for (const [i, s] of lines.entries()) {
    const line = s.trim();
    if (line === '') {
      if ((!section && empty > 0) || (section)) {
        warnFixup(`removed empty line at line ${i + 1}`, file);
      } else {
        out.push(line);
      }
      empty++;
      continue;
    }
    empty = 0;
    if (s.startsWith('##')) {
      out.push(line);
      continue;
    }
    if (s.startsWith('-')) {
      out.push(line);
      section = line.slice(1).trim();
      sections[section] = {};
      continue;
    }
    if (s.startsWith('  -')) {
      const { skill, level } = formatSkill(line);
      if (level === undefined) {
        const msg = 'not matching level and emoji';
        wrongFormat(`${msg} «${line}» at line ${i + 1}`, file);
        out.push(`${s} 👉 Warning: ${msg}`);
        skills.add(skill);
        continue;
      }
      if (skills.has(skill) && options.unique) {
        warnFixup(`removed duplicate skill «${skill}» at line ${i + 1}`, file);
      } else {
        if (level) {
          out.push(`  - ${skill}: ${level}`);
          sections[section][skill] = level;
        } else {
          out.push(`  - ${skill}`);
          sections[section][skill] = '';
        }
        skills.add(skill);
      }
      continue;
    }
    wrongFormat(`unkonw structure at line ${i + 1}`, file);
  }
  const output = out.join('\n') + '\n';
  if (data !== output) {
    fs.writeFile(file, output).catch(() => {});
    const fileName = file.slice(PATH.length);
    console.log(`Fixup: ${data.length} -> ${output.length} saved: ${fileName}`);
  }
  return { sections, skills };
};

const analise = async (dir, unit, options) => {
  console.log(caption`Unit: ${unit}`);
  const file = `${dir}/${unit}.md`;
  const md = await loadFile(file);
  const data = getSkills(md, file, options);
  const { sections, skills } = data;
  const count = Object.keys(sections).length;
  console.log(`Sections: ${count}, Skills: ${skills.size}\n`);
  return data;
};

const loadDir = async (place, options = {}) => {
  const dir = path.join(PATH, place);
  const files = await fs.readdir(dir);
  const units = files
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.substring(0, file.length - '.md'.length));
  const collection = {};
  for (const unit of units) {
    collection[unit] = await analise(dir, unit, options);
  }
  return collection;
};

(async () => {
  console.log(caption`${TITLE}`);
  console.log('Auto Checker\n');

  const skills = await loadDir('Skills', { unique: true });
  const roles = await loadDir('.github/src/Roles');

  const badgeCode = codeBlock(BADGE);
  const report = `## ${TITLE}\n\n${BADGE}\n\n${badgeCode}\n`;
  await fs.writeFile(`${PATH}/Profile/REPORT.md`, report);

  const template = await loadFile(`${PATH}/.github/src/Templates/README.md`);
  const readme = template.replace('$BADGE', BADGE);
  await fs.writeFile(`${PATH}/README.md`, readme);

  console.log('');
  process.exit(exitCode);
})();
