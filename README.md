## Software engineering self assessment

<!--- $BADGE -->

This _knowledge assessment_ can be used as an automated tool for **tracking** and **analyzing** an engineer’s **microskills**, for personal use, for reference in your **CV** or profile (github, linkedin, etc.). After filling skills, the system generates a button in `html` and `md` with a link to your fork of the repo. The tool speeds up **interviews** and **certification** for both the applicant and the interviewer: you can check only part of the key knowledge and then sign a commit with a personal GPG key. If you periodically take an assessment, or do it before and after the start of _training_, and store branches or tags with the results of an inventory of microskills at a certain point in time, then it is very convenient to compare the _progress_ you have made during the period of _training_, reading a book, working on a project etc. Currently, assessment has more than **700 microskills** and will be constantly expanded in all areas, languages and technologies (for example `Proxy`, `Promise`, `Future`, `SRP`, `DI`, `Boxing`, `Cohesion`, `Tail call recursion`...) with automatic comparison of them with _roles_ (for example `Node.js API developer`, `Node.js gamedev`, `Frontend`...) the robot generates a report via `Github Actions CI` with recommendations on what needs to be improved. New roles and knowledge areas will be available soon, after which you can rebase your repo on the original one to receive the new report.

## Skills

- [Programming fundamentals](Skills/Programming.md)
- [JavaScript](Skills/JavaScript.md)
- [Asynchronous programming](Skills/Async.md)
- [Node.js and Backend](Skills/NodeJS.md)
- [.NET](Skills/DotNET.md)
- [Multi-paradigm programming](Skills/Paradigms.md)
- [Databases](Skills/Databases.md)
- [Architecture](Skills/Architecture.md)

## How to use

- Fork repository
- Enable Github Actions workflows at tab `Actions` of your fork
- Create branch, for example: `2024-winter`
- In new branch add following levels or leave line untouched in each file:

|      | Level         | Shorthand  | Description                                            |
| ---- | ------------- | ----------:| ------------------------------------------------------ |
| `👂` | `heard`       | `~` or `h` | Heard or have some idea                                |
| `🎓` | `known`       | `+` or `k` | Learned, read, but didn’t use                          |
| `🖐️` | `used`        | `*` or `u` | Used in work or real project                           |
| `🙋` | `explained`   | `!` or `e` | Explained to colleagues or can freely explain          |
| `📢` | `talked`      | `"` or `t` | Gave a public speech or lecture on a topic             |
| `🔬` | `researched`  | `&` or `r` | Deep research, measurements, comparisons, read sources |
| `🚀` | `constructed` | `^` or `c` | Developed an implementation or equivalent              |

- Now you can create pull request and merge this to main branch of your fork (not to original repo)
- Pull request will fire Github Actions CI processing which will generate new commit with `Profile/REPORT.md` file with skill analysis and role matching report
- CI processing will fix all simple mistakes in filling and replace shorthands
- If CI processing will detect unrecoverable error it will generate debug output and you will receive email with link
- Auto-generated commit will also contain badge in `md` and `html` formats
- Repeat self assessment after course or training
- Now You can compare branches with URL:
  - `https://github.com/<YOUR-ACCOUNT>/SelfAssessment/compare/2023-autumn...2024-winter`

## Example

It should look like following example after filling it out. And will be automatically formatted as sown in right column:

```
- Syntax                       - Syntax
  - Value !             ⤑        - Value: 🙋 explained
  - Identifier: *       ⤑        - Identifier: 🖐️ used
  - Variable: !         ⤑        - Variable: 🙋 explained
  - Constant *          ⤑        - Constant: 🖐️ used
  - Scalar *            ⤑        - Scalar: 🖐️ used
  - Literal ~           ⤑        - Literal: 👂 heard
  - Expression: *       ⤑        - Expression: 🖐️ used
  - Heap: +                      - Heap: 🎓 known
```
