# agent-kit

个人 AI 编码代理的 **skill / rule 仓库**（默认面向 Cursor）。集中维护跨项目通用的规则（rules）与技能（skills），通过软链接部署到全局 `~/.cursor` 或各项目的 `.cursor` 下，做到「一处维护、处处生效」。

> skills（`SKILL.md`）是跨工具开放标准，可移植到 Claude Code / Codex 等；rules（`.mdc`）目前为 Cursor 专属。
>
> 本仓库本身**不是**要被 Cursor 当工作区加载的项目，只作为源（source of truth）。

## 设计思想与来源

把成熟的软件工程方法论「编码」进 AI 代理；以下注明出处，以示尊重。

> 本仓库部分 skill 的理念参考自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT License），其中 `caveman` 为其同名 skill 的中文改写版，在此致谢。其余 skill 由 AI 综合通行工程标准/方法论实现。各 skill 所依据的思想与标准见下文[清单](#清单)的「来源」列（指思想出处，而非代码出处）。

- **一处维护、处处生效** — 单一事实源 + 软链分发（DRY，《The Pragmatic Programmer》；dotfiles 惯例）。
- **Rule / Skill 二分** — Rule 是常驻约束、Skill 是按需流程（关注点分离 SoC；`SKILL.md` 对齐 Anthropic [Agent Skills](https://www.anthropic.com/news/agent-skills) 开放标准）。

**Rules — `behavior.mdc`**

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
├── install.sh              # 软链到 ~/.cursor 或项目 .cursor
├── uninstall.sh
├── rules/                  # 通用规则（*.mdc）
│   └── behavior.mdc
└── skills/                 # 通用技能（一 skill 一文件夹）
    └── <skill-name>/
        └── SKILL.md        # explore / grill / tdd / diagnose / review
                            #   commit / docs / adr / retro / caveman
```

- **rules/**：平铺 `.mdc` 文件，每个文件带 frontmatter（`description` / `alwaysApply` / `globs`）。
- **skills/**：每个 skill 一个子文件夹，内含 `SKILL.md`，便于整目录部署。

## 部署

内容需链接到 Cursor 实际加载的位置才会生效：

- 全局：`~/.cursor/rules/`、`~/.cursor/skills/`
- 项目级：`<项目>/.cursor/rules/`、`<项目>/.cursor/skills/`

用 `install.sh` 一键软链（改动随仓库自动同步，无需重装）：

```bash
./install.sh                       # 装到全局 ~/.cursor
./install.sh --project ../gadget   # 装到某项目的 .cursor
./install.sh --dry-run             # 预览不执行

./uninstall.sh                       # 从全局撤销
./uninstall.sh --project ../gadget   # 从某项目撤销
```

- 用软链而非拷贝：在本仓库改完，全局/项目立即生效。
- `install.sh` 遇到同名「真实文件/目录」（非软链）会跳过并提示，不覆盖既有内容。
- `uninstall.sh` 只删「指回本仓库」的软链，其它一律不动。

## 约定

- **Rule**：约束类（风格、边界、禁止项）。通用规则优先用 `alwaysApply: true` 或 `description` 语义触发；慎用相对路径 `globs`（部署到全局时不同项目下未必命中）。
- **Skill**：流程类（多步操作手册）。`SKILL.md` 的描述要写清「**何时使用**」，否则不会被主动触发。

## 清单

### Rules

| 文件 | 作用 |
|------|------|
| `behavior.mdc` | 全局编码行为基线：自主、精简、最小 diff、自验，含破坏性操作与 Git 写入的安全红线 |

### Skills

顺序同典型串联流程。「来源」指所依据的思想/标准，非代码出处。

| 名称 | 作用 | 来源 / 依据 |
|------|------|-----------|
| `explore` | 只读地快速摸清陌生代码：定位入口/结构/数据流与约定，产出带 `path:line` 的精简上手说明 | 理念近 mattpocock/skills `zoom-out`；代码考古 |
| `grill` | 解决问题前的审问对齐：逐个提问、能查代码先查、厘清术语与边界，达成可验证的共识后再动手 | 参考 mattpocock/skills `grill-me`；苏格拉底式提问 |
| `tdd` | 测试驱动开发循环（红-绿-重构）：先写失败测试、确认变红、最小实现转绿、再重构，小步推进；自动沿用项目现有测试框架 | 参考 mattpocock/skills `tdd`；Kent Beck TDD |
| `diagnose` | 系统化根因分析：复现、取证、提假设、验证、定位根因后再给修复建议（定位阶段不动代码） | 参考 mattpocock/skills `diagnose`；科学方法 / 5 Whys |
| `review` | 结构化只读代码审查：聚焦改动，按 Blocker/Major/Minor/Nit 分级，带 `文件:行` 与修复建议，结尾给合并结论 | 代码审查 + 严重度分级（[Google Code Review](https://google.github.io/eng-practices/review/)） |
| `commit` | 规范化 git 提交（可选开 PR）：审阅改动、按 Conventional Commits 写「为什么」、只提交相关文件、避开 secrets（仅在明确要求时执行） | [Conventional Commits](https://www.conventionalcommits.org) |
| `docs` | 写/更新文档：内容忠于代码、优先改现有文档、匹配既有风格、保持精简；覆盖 README / API / changelog | docs-as-code / [Keep a Changelog](https://keepachangelog.com) |
| `adr` | 架构决策记录：仅记难撤销/无背景会困惑/有真实权衡的决策，Accepted 后不可改、变更走 supersede | Michael Nygard，[ADR](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) |
| `retro` | 复盘（个人任务 / 团队迭代）：梳理顺利与问题、挖根因、出行动项，并可把教训回写到 rules/skills/docs | 敏捷回顾 + 无指责复盘（[Google SRE](https://sre.google/sre-book/postmortem-culture/)） |
| `caveman` | 超压缩中文沟通模式：砍客套虚词、token 省约 75%，技术内容与代码不变，破坏性操作时自动恢复正常表述 | 中文改写自 mattpocock/skills [`caveman`](https://github.com/mattpocock/skills) |

## 使用场景

按需挑用，不必每次走完整流程。

| skill | 什么时候用 | 你会怎么说 |
|-------|-----------|-----------|
| `explore` | 接手陌生项目/模块，先搞懂再动 | "带我熟悉下这个网络模块" |
| `grill` | 需求模糊、方案没定，动手前对齐 | "动手前先帮我把方案捋清楚" |
| `tdd` | 稳着实现一个新功能/改行为 | "用 TDD 实现这个校验" |
| `diagnose` | 出 bug / 报错 / 行为诡异，原因不明 | "偶发失败，排查下根因" |
| `review` | 改完了、合并前把关 | "审一下我这次的改动" |
| `commit` | 确定要提交了 | "帮我提交" / "提个 PR" |
| `docs` | 功能做完要写/更新说明 | "更新下 README" / "写条 changelog" |
| `adr` | 拍了个难撤销的重大技术决策要存档 | "把这个选型决策记下来" |
| `retro` | 一个任务/迭代收尾，想复盘提炼 | "这次复盘一下" |
| `caveman` | 想让回话极简、省 token | "野人模式" / "精简点" |

> `behavior.mdc` 是**常驻规则**，每轮自动生效（无需调用）；`caveman` 是**对话模式**，开启后持续到说「正常模式」。

### 典型串联（举例：加一个功能）

```
explore → grill → tdd → diagnose（卡住时）→ review → commit → docs → adr（重大决策）→ retro
```

### 易混分工

- **explore vs grill**：explore 摸**代码现状**（客观）；grill 对齐**需求意图**（主观）。常 explore 在前。
- **diagnose vs review**：diagnose 是**坏了之后**找原因（救火）；review 是**改完之后**找隐患（防火）。

## License

[MIT](LICENSE)。`caveman` 改编自 [mattpocock/skills](https://github.com/mattpocock/skills)（MIT, © Matt Pocock），详见 [`NOTICE`](NOTICE)。

> 本仓库为个人方法论库，自用为主、开放分享，按需不定期更新。欢迎提 issue/PR，会尽量抽空看。
