## Software engineering self assessment

## Skills

- [Programming fundamentals](Skills/Programming.md)
- [JavaScript](Skills/JavaScript.md)
- [Asynchronous programming](Skills/Async.md)
- [Node.js and Backend](Skills/NodeJS.md)
- [Multi-paradigm programming](Skills/Paradigms.md)
- [Architecture](Skills/Architecture.md)

## How to use

- Fork repository
- Enable Githib Actions workflows at tab `Actions` of your fork
- Create branch, for example: `2024-winter`
- In new branch add following levels or leave line untouched in each file:
  - `👂 heard`, `🎓 known`, `🖐️ used`, `🙋 explained`, `📢 talked`, `🔬 researched`, `🚀 constructed`
  - You can use just emojis: `👂`, `🎓`, `🖐️`, `🙋`, `📢`, `🔬`, `🚀`
  - or just text levels: `heard`, `known`, `used`, `explained`, `talked`, `researched`, `constructed`
  - or just shorthands: `~` for `heard`, `+` for `known`, `*` for `used`, `!` for `explained`
- Now you can create pull request and merge this to main branch of your fork (not to original repo)
- Pull request will fire Github Actions CI processing which will generate new commit with `Profile/REPORT.md` file with skill analisis and role matching report
- CI processing will fix all simple mistakes in filling and replace shorthands
- If CI processing will detect unrecoverable error it will generate dubug output and you will receive email with link
- Auto-generated commit will also contain bagde in `md` and `html` formats
- Repeat self assessment after course or training
- Now You can compare branches with URL:
  - `https://github.com/<YOUR-ACCOUNT>/SelfAssessment/compare/2023-autumn...2024-winter`

## Example

It should look like following example after filling it out:

```
- Syntax
  - Value: 🙋 explained
  - Identifier: 🖐️ used
  - Variable: 🙋 explained
  - Constant: 🖐️ used
  - Scalar: 🖐️ used
  - Literal: 👂 heard
  - Expression: 🖐️ used
  - Heap: 🎓 known
```

Alternative example (will be automatically formatted as above example):

```
- Syntax
  - Value !
  - Identifier: *
  - Variable: !
  - Constant *
  - Scalar *
  - Literal ~
  - Expression: *
  - Heap: +
```
