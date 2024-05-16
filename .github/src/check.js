'use strict';

const fs = require('node:fs').promises;
const path = require('node:path');
const cp = require('node:child_process');
const metautil = require('metautil');
const concolor = require('concolor');

const caption = concolor('b,white');
const chapter = concolor('b,yellow');
const fatal = concolor('b,white/red');
const fixup = concolor('b,black/yellow');

let exitCode = 0;

const TITLE = 'Software engineering self assessment';
const PARSING_TIMEOUT = 1000;
const EXECUTION_TIMEOUT = 5000;
const PATH = path.join(process.cwd(), '../..');
const SEPARATOR = '&nbsp;/&nbsp;';

let REPO = process.env.GITHUB_REPOSITORY;
if (!REPO) {
  const OUT = cp.execSync('git config --get remote.origin.url').toString();
  REPO = metautil.between(OUT, ':', '.');
}
const LINK = 'https://github.com/' + REPO + '/blob/main/Profile/REPORT.md';

const BASE = 'https://img.shields.io/badge/Self_Assessment';
const STYLE = `style=flat-square`;

const codeBlock = (code) => '```\n' + code + '\n```';

const overall = { count: 0, total: 0, all: 0 };

const generateBadge = () => {
  const color = exitCode === 0 ? '009933' : 'FF3300';
  const stat = overall.count + SEPARATOR + overall.total + SEPARATOR + overall.all;
  const img = `${BASE}-${stat}-${color}?${STYLE}`;
  return {
    md: `[![Skills](${img})](${LINK})`,
    html: `<a href="${LINK}"><img alt="Skills" src="${img}"></a>`,
  };
};

const UNITS = [
  'Programming',
  'JavaScript',
  'Async',
  'NodeJS',
  'Paradigms',
  'Architecture',
];

const wrongFormat = (msg, file) => {
  exitCode = 1;
  console.log(fatal` Wrong file format: ${msg} `);
  console.log(fatal` File: ${file} `);
};

const warnFixup = (msg, file) => {
  console.log(fixup` Fixup file format: ${msg} `);
  console.log(fixup` File: ${file} `);
};

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

const SYMBOLS = ['~', '+', '*', '!', '"', '&', '^'];
const LETTERS = ['h', 'k', 'u', 'e', 't', 'r', 'c'];
const LEVEL_COMMON = ['heard', 'known', 'used', 'explained'];
const LEVEL_EXT = ['talked', 'researched', 'constructed'];
const LEVEL = [...LEVEL_COMMON, ...LEVEL_EXT];
const EMOJI = ['👂', '🎓', '🖐️', '🙋', '📢', '🔬', '🚀'];
const LEVEL_EMOJI = Object.fromEntries(LEVEL.map((n, i) => [n, EMOJI[i]]));
const EMOJI_LEVEL = Object.fromEntries(EMOJI.map((n, i) => [n, LEVEL[i]]));
const LABELS = LEVEL.map((n, i) => `${EMOJI[i]} ${n}`);
const LEVEL_LABELS = ['🤷 unknown', ...LABELS];

const removeColon = (line) => {
  const s = line.trim();
  if (!s.endsWith(':')) return s;
  return s.substring(0, s.length - 1).trim();
};

const useShorthand = (s) => {
  let index = -1;
  for (const symbol of SYMBOLS) {
    if (s.endsWith(symbol)) {
      index = SYMBOLS.indexOf(symbol);
      break;
    }
  }
  if (index === -1 && s.at(-2) === ' ') {
    const last = s.at(-1).toLowerCase();
    index = LETTERS.indexOf(last);
  }
  if (index >= 0) {
    const emoji = EMOJI[index];
    return s.substring(0, s.length - 1) + emoji;
  }
  return s;
};

const formatSkill = (line) => {
  let skill = removeColon(line.substring(1).trim());
  skill = useShorthand(skill);
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
  const skills = new Map();
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
        skills.set(skill, '');
        continue;
      }
      if (skills.has(skill) && options.unique) {
        warnFixup(`removed duplicate skill «${skill}» at line ${i + 1}`, file);
      } else {
        let row = `  - ${skill}`;
        if (level) row += `: ${level}`;
        out.push(row);
        const value = level || '';
        sections[section][skill] = value;
        skills.set(skill, value);
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
  console.log(chapter`  Unit: ${unit}`);
  const file = `${dir}/${unit}.md`;
  const md = await loadFile(file);
  const data = getSkills(md, file, options);
  const { sections, skills } = data;
  const count = Object.keys(sections).length;
  console.log(`  Sections: ${count}, Skills: ${skills.size}\n`);
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

const match = (expected, answered) => {
  const todo = [];
  for (const section in expected.sections) {
    todo.push(`\n| ${section} | actual | ⟶  | required |`);
    todo.push(`| --- | --- | --- | --- |`);
    const needed = expected.sections[section];
    let count = 0;
    let have = 0;
    let above = 0;
    let upgrade = 0;
    const entries = Object.entries(needed);
    const propose = [];
    for (const [skill, level] of entries) {
      if (level) count++;
      const actual = answered.skills.get(skill) || '🤷 unknown';
      const actualIndex = LEVEL_LABELS.indexOf(actual);
      const levelIndex = LEVEL_LABELS.indexOf(level || '🤷 unknown');
      if (actualIndex < levelIndex) {
        upgrade++;
        propose.push(`| ${skill} | ${actual} | ⟶  | ${level} |`);
      }
      if (actualIndex > levelIndex) above++;
      if (actualIndex >= levelIndex && levelIndex !== 0) have++;
    }
    if (have) todo.push(...propose);
    const total = `you have \`${have}\` of \`${count}\` skills`;
    const ext = `\`${upgrade}\` to be upgraded, and \`${above}\` above needed`;
    todo.push(`\nTotal: ${total}, ${ext}`);
  }
  return todo;
};

const NBSP = '&nbsp;&nbsp;&nbsp;&nbsp;';

const getTotal = (answered) => {
  const total = [];
  for (const section in answered.sections) {
    const skills = answered.sections[section];
    let count = 0;
    const entries = Object.values(skills);
    for (const level of entries) {
      if (level) count++;
    }
    total.push(`| ${NBSP} ${section} | \`${count}\` | \`${entries.length}\` |`);
    if (count > 0) {
      overall.count += count;
      overall.total += entries.length;
    }
    overall.all += entries.length;
  }
  return total;
};

(async () => {
  console.log(caption`${TITLE}`);
  console.log('Auto Checker\n');

  console.log(caption`Load skills`);
  const skills = await loadDir('Skills', { unique: true });

  console.log(caption`Load roles`);
  const roles = await loadDir('.github/src/Roles');

  console.log(caption`Match profiles`);
  const todos = [];
  const totals = ['## Assessment totals\n'];
  totals.push(`| Unit | Marked | Of |`);
  totals.push(`| ---- | ------ | -- |`);
  for (const unit of UNITS) {
    console.log(chapter`  Unit: ${unit}`);
    const expected = roles[unit];
    const answered = skills[unit];
    if (expected) {
      const todo = match(expected, answered);
      todos.push(`\n## [${unit}](/Skills/${unit}.md)\n`);
      todos.push(...todo);
    }
    totals.push(`| [${unit}](/Skills/${unit}.md) | | |`);
    const total = getTotal(answered);
    totals.push(...total);
  }

  const badge = generateBadge();
  const badgeCode = `${codeBlock(badge.md)}\n\n${codeBlock(badge.html)}`;
  const report = [
    `## ${TITLE}\n\n${badge.md}\n\n${badgeCode}\n`,
    ...totals,
    ...todos,
  ];
  const profileReport = report.join('\n') + '\n';
  await fs.writeFile(`${PATH}/Profile/REPORT.md`, profileReport);

  const readmeFile = `${PATH}/README.md`;
  const template = await loadFile(readmeFile);
  const readme = template.replace('<!--- $BADGE -->', badge.md);
  await fs.writeFile(readmeFile, readme);

  console.log('');
  process.exit(exitCode);
})();
