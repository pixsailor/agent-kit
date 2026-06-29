# agent-kit

个人 AI 编码代理的 **skill / rule 仓库**。集中维护跨项目通用的规则（rules）与技能（skills），用一份纯 markdown 源 + 安装脚本部署到全局或各项目，做到「一处维护、处处生效」。

> 行为规则的单一源是 `rules/behavior.md`（纯 markdown），安装器按 `--target` 部署到 Cursor / Codex / Claude Code / Gemini CLI / Windsurf / Cline / Roo——多数平台软链即时同步，Cursor 因需 frontmatter 走「生成 `.mdc`」。安装器有两套等价入口：`install.sh`（bash）与 `bin/agent-kit`（Node CLI，跨平台含 Windows）。
>
> skills（`SKILL.md`）是跨工具开放标准，按 `--target` 软链到各平台自己的 skills 目录（Cursor / Claude / Codex / Gemini / Windsurf / Cline；Roo 无 skills 机制）。
>
> 本仓库本身**不是**要被 Cursor 当工作区加载的项目，只作为源（source of truth）。

## 设计思想与来源

把成熟的软件工程方法论「编码」进 AI 代理；以下注明出处，以示尊重。

> 本仓库部分 skill 的理念参考自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT License），其中 `caveman` 为其同名 skill 的中文改写版，在此致谢。其余 skill 由 AI 综合通行工程标准/方法论实现。各 skill 所依据的思想与标准见下文[清单](#清单)的「来源」列（指思想出处，而非代码出处）。

- **一处维护、处处生效** — 单一事实源 + 按 target 适配分发（DRY，《The Pragmatic Programmer》；dotfiles 惯例）。一份 `behavior.md`，脚本按各平台格式产出。
- **Rule / Skill 二分** — Rule 是常驻约束、Skill 是按需流程（关注点分离 SoC；`SKILL.md` 对齐 Anthropic [Agent Skills](https://www.anthropic.com/news/agent-skills) 开放标准）。

**Rules — `behavior.md`**

| 原则 | 来源 |
|------|------|
| 自主先行动、必要才问 | agentic AI / human-in-the-loop |
| 精简直答、不啰嗦 | Grice 合作原则·量的准则（说够即止） |
| 简单优先、不过度设计 | KISS / YAGNI |
| 最小 diff、不顺手重构 | Unix 哲学（做一件事做好） |
| 注释克制、代码自解释 | Robert C. Martin《Clean Code》 |
| 目标驱动 + 自验证 | TDD 思维（可验证目标） |
| fix-forward、必要时回滚 | 运维 fix-forward 实践 |
| 安全红线、只读/写分离 | 最小权限原则（least privilege） |

各 skill 的来源/依据见下文[清单](#清单)。

## 目录结构

```
agent-kit/
├── install.sh              # bash 安装器（macOS/Linux）
├── uninstall.sh
├── validate.sh             # 校验 skills 的 frontmatter（name/description/触发词）
├── bin/
│   └── agent-kit           # Node CLI（跨平台，含 Windows；与 .sh 等价）
├── rules/                  # 行为规则源
│   └── behavior.md         # 纯 markdown 单一源（Cursor 的 frontmatter 由脚本注入）
└── skills/                 # 通用技能（一 skill 一文件夹）
    └── <skill-name>/
        └── SKILL.md        # propose（统筹）/ explore / grill / tdd / diagnose
                            #   review / commit / docs / gen-doc / adr / retro / caveman
```

- **rules/**：`behavior.md` 为纯 markdown 单一源。Cursor 的 `.mdc`（含 `description` / `alwaysApply` frontmatter）由 `install.sh` 在部署时生成。
- **skills/**：每个 skill 一个子文件夹，内含 `SKILL.md`，便于整目录部署。

## 部署

把 `behavior.md` 按目标工具的格式/位置产出，`--target` 选工具（逗号分隔，默认 `all`），`--components` 选只装 rules / skills / 全部（逗号分隔，默认 `all`）。两套等价入口：

- **`install.sh`（bash）**：macOS / Linux（或 WSL、Git Bash）。
- **`bin/agent-kit`（Node CLI，跨平台，含 Windows）**：参数与 `.sh` 一致。

```bash
# bash（macOS/Linux）
./install.sh                              # 全装（all）到各工具全局目录
./install.sh --target cursor              # 只装 Cursor
./install.sh --target codex,claude        # 只装 Codex + Claude Code
./install.sh --components skills          # 只装 skills（不动 rules）
./install.sh --components rules           # 只装 rules（不动 skills）
./install.sh --target cursor --components skills  # 仅给 Cursor 装 skills
./install.sh --target all --project ../x  # 项目级部署到 ../x
./install.sh --dry-run                    # 预览不执行
./uninstall.sh --target codex,claude      # 按 target 撤销
./uninstall.sh --components skills        # 只卸 skills

# Node CLI（全平台，含 Windows，需已装 Node）
node bin/agent-kit install                       # 等价于 ./install.sh
node bin/agent-kit install --target codex,claude
node bin/agent-kit install --components skills   # 只装 skills
node bin/agent-kit install --project ../x --dry-run
node bin/agent-kit uninstall --target cursor
node bin/agent-kit validate                      # 校验 skills 的 frontmatter
```

> `--target` 与 `--components` 可组合。无论选哪些组件，未知 target 一律拦截并提示跳过。

各 target 的全局位置与方式（behavior + skills 各自的目录）：

| target | behavior 全局位置 | behavior 方式 | skills 全局目录 |
|--------|------------------|--------------|----------------|
| `cursor` | `~/.cursor/rules/behavior.mdc` | 生成 `.mdc`（注入 frontmatter） | `~/.cursor/skills/` |
| `codex` | `~/.codex/AGENTS.md` | 软链 | `~/.agents/skills/` |
| `claude` | `~/.claude/CLAUDE.md` | 软链 | `~/.claude/skills/` |
| `gemini` | `~/.gemini/GEMINI.md` | 软链 | `~/.gemini/skills/` |
| `windsurf` | `~/.codeium/windsurf/memories/global_rules.md` | 软链 | `~/.codeium/windsurf/skills/` |
| `cline` | `~/Documents/Cline/Rules/behavior.md` | 软链 | `~/.cline/skills/` |
| `roo` | `~/.roo/rules/behavior.md` | 软链 | —（无 skills 机制） |

- **软链类（codex/claude/gemini/windsurf/cline/roo）**：改 `behavior.md` 立即生效，无需重装。
- **Cursor 的 behavior 为生成式**：`.mdc` 需要 frontmatter，无法纯软链——**改完 `behavior.md` 要重跑 `./install.sh --target cursor`** 才会更新。
- **skills 逐个子目录软链**到各平台 skills 目录（`SKILL.md` 是跨工具开放标准）；改**已有** skill 内容立即生效，但**新增/删除 skill 需重跑安装**（如 `./install.sh --target cursor`）才会建立/移除对应软链。Roo 无 skills 机制，只部署 behavior。
- 安装器遇到同名「真实文件」（非本仓库软链、且非脚本生成的 `.mdc`）会跳过并提示，不覆盖。
- 卸载只删「指回本仓库的软链」与「带 `agent-kit:managed` 标记的生成文件」，其它一律不动。
- **Windows（Node CLI）**：skills 目录用 junction（无需管理员）；behavior 文件软链若无权限则降级为**复制**（改源需重跑安装）。Cursor 本就是生成式，不受影响。

## 约定

- **Rule**：约束类（风格、边界、禁止项）。通用规则优先用 `alwaysApply: true` 或 `description` 语义触发；慎用相对路径 `globs`（部署到全局时不同项目下未必命中）。
- **Skill**：流程类（多步操作手册）。`SKILL.md` 的描述要写清「**何时使用**」，否则不会被主动触发。
- **校验**：改/加 skill 后跑 `./validate.sh`（或 `node bin/agent-kit validate`），检查每个 `SKILL.md` 的 frontmatter（`name` 与目录名一致、含 `description` 与触发词）。新增 skill 记得重跑安装。

## 清单

### Rules

| 文件 | 作用 |
|------|------|
| `behavior.md` | 全局编码行为基线：自主、精简、最小 diff、自验，含破坏性操作与 Git 写入的安全红线（跨工具部署，Cursor 端生成为 `.mdc`） |

### Skills

顺序同典型串联流程。「来源」指所依据的思想/标准，非代码出处。

| 名称 | 作用 | 来源 / 依据 |
|------|------|-----------|
| `propose` | 编排层：把目标拆成有序、可确认的计划，并把每步映射/调度到本仓库其它 skill；仅在用户显式要求规划时触发 | 工作流编排（自建 meta-skill）；任务分解 |
| `explore` | 只读地快速摸清陌生代码：定位入口/结构/数据流与约定，产出带 `path:line` 的精简上手说明 | 理念近 mattpocock/skills `zoom-out`；代码考古 |
| `grill` | 解决问题前的审问对齐：逐个提问、能查代码先查、厘清术语与边界，达成可验证的共识后再动手 | 参考 mattpocock/skills `grill-me`；苏格拉底式提问 |
| `tdd` | 测试驱动开发循环（红-绿-重构）：先写失败测试、确认变红、最小实现转绿、再重构，小步推进；自动沿用项目现有测试框架 | 参考 mattpocock/skills `tdd`；Kent Beck TDD |
| `diagnose` | 系统化根因分析：复现、取证、提假设、验证、定位根因后再给修复建议（定位阶段不动代码） | 参考 mattpocock/skills `diagnose`；科学方法 / 5 Whys |
| `review` | 结构化只读代码审查：聚焦改动，按 Blocker/Major/Minor/Nit 分级，带 `文件:行` 与修复建议，结尾给合并结论 | 代码审查 + 严重度分级（[Google Code Review](https://google.github.io/eng-practices/review/)） |
| `commit` | 规范化 git 提交（可选开 PR）：审阅改动、按 Conventional Commits 写「为什么」、只提交相关文件、避开 secrets（仅在明确要求时执行） | [Conventional Commits](https://www.conventionalcommits.org) |
| `docs` | 写/更新文档：内容忠于代码、优先改现有文档、匹配既有风格、保持精简；覆盖 README / API / changelog | docs-as-code / [Keep a Changelog](https://keepachangelog.com) |
| `gen-doc` | 按编程语言生成中英双语代码注释：TS/JS 用 JSDoc（`@en`/`@zh`）、Python 用 Google docstring、Go 用 godoc、Java/Kotlin 用 Javadoc、Rust 用 rustdoc；含粒度判断（公开 API 必写、内部 helper 按需）与副作用标注 | 双语注释规范（自建） |
| `adr` | 架构决策记录：仅记难撤销/无背景会困惑/有真实权衡的决策，Accepted 后不可改、变更走 supersede | Michael Nygard，[ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) |
| `retro` | 复盘（个人任务 / 团队迭代）：梳理顺利与问题、挖根因、出行动项，并可把教训回写到 rules/skills/docs | 敏捷回顾 + 无指责复盘（[Google SRE](https://sre.google/sre-book/postmortem-culture/)） |
| `caveman` | 超压缩中文沟通模式：砍客套虚词、token 省约 75%，技术内容与代码不变，破坏性操作时自动恢复正常表述 | 中文改写自 mattpocock/skills [`caveman`](https://github.com/mattpocock/skills) |

## 使用场景

按需挑用，不必每次走完整流程。

| skill | 什么时候用 | 你会怎么说 |
|-------|-----------|-----------|
| `propose` | 任务多步，想先规划并串起多个 skill 再动手 | "制定执行计划" / "统筹下怎么推进" |
| `explore` | 接手陌生项目/模块，先搞懂再动 | "带我熟悉下这个网络模块" |
| `grill` | 需求模糊、方案没定，动手前对齐 | "动手前先帮我把方案捋清楚" |
| `tdd` | 稳着实现一个新功能/改行为 | "用 TDD 实现这个校验" |
| `diagnose` | 出 bug / 报错 / 行为诡异，原因不明 | "偶发失败，排查下根因" |
| `review` | 改完了、合并前把关 | "审一下我这次的改动" |
| `commit` | 确定要提交了 | "帮我提交" / "提个 PR" |
| `docs` | 功能做完要写/更新说明 | "更新下 README" / "写条 changelog" |
| `gen-doc` | 给代码加中英双语注释 | "生成文档注释" / "写 JSDoc" / "补 docstring" |
| `adr` | 拍了个难撤销的重大技术决策要存档 | "把这个选型决策记下来" |
| `retro` | 一个任务/迭代收尾，想复盘提炼 | "这次复盘一下" |
| `caveman` | 想让回话极简、省 token | "野人模式" / "精简点" |

> `behavior.md` 是**常驻规则**，每轮自动生效（无需调用）；`caveman` 是**对话模式**，开启后持续到说「正常模式」。

### 典型串联（举例：加一个功能）

```
explore → grill → tdd → diagnose（卡住时）→ review → commit → docs → adr（重大决策）→ retro
```

> `propose` 不在这条线里，而是**统筹层**：显式调用时由它规划整条链并按需调度上面各 skill。

### 易混分工

- **propose vs grill**：propose 出**可执行步骤计划**并调度其它 skill（编排）；grill 是**拷问需求**对齐理解（不产出步骤）。
- **explore vs grill**：explore 摸**代码现状**（客观）；grill 对齐**需求意图**（主观）。常 explore 在前。
- **diagnose vs review**：diagnose 是**坏了之后**找原因（救火）；review 是**改完之后**找隐患（防火）。

## License

[MIT](LICENSE)。`caveman` 改编自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT, © Matt Pocock），详见 [`NOTICE`](NOTICE)。

> 本仓库为个人方法论库，自用为主、开放分享，按需不定期更新。欢迎提 issue/PR，会尽量抽空看。
