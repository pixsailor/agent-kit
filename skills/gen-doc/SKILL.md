---
name: gen-doc
description: Generate bilingual (English + Chinese) doc comments per language convention — JSDoc for TS/JS, Google docstring for Python, godoc for Go, Javadoc for Java, rustdoc for Rust. Use when the user asks to generate docs, write JSDoc, add docstrings, or annotate code. 触发：用户说"生成文档注释""写 JSDoc""补 docstring""annotate code"。
---

# gen-doc

## Rules
- Read the implementation first — never infer behavior from names alone
- All comments must be bilingual: `@en` first, `@zh` second, semantically equivalent
- Keep technical terms in English: blob, ctx, registry, opcode, token, etc.
- Insert only — do not modify the annotated code logic
- If a comment already exists, update it rather than duplicate
- If `@zh` reads like machine translation, rewrite it and note the reason inline

## When to annotate
- **Always**: exported functions, classes, types, interfaces, module entry points
- **Only if**: unexported helpers with 3+ branches, recursion, or non-obvious side effects
- **Never**: trivial wrappers, one-liner getters, self-evident code

## Async / side effects (omit when not applicable)
- `[async]` prefix on summary line — async functions only; not applicable in Go
- `@sideeffect` — writes to disk, network, or global state
- `@mutates` — modifies a parameter in place
- Both tags are independent and can coexist

---

## TypeScript / JavaScript — JSDoc

### Function

```ts
/**
 * @en [async] Resolve a formula identifier against the current registry scope.
 * @zh [异步] 在当前 registry 作用域内解析公式标识符。
 *
 * @param id - @en Fully-qualified formula identifier (e.g. `"math.sum"`). @zh 完全限定的公式标识符（如 `"math.sum"`）。
 * @returns @en The resolved formula, or undefined if not found. @zh 解析结果，未找到时返回 undefined。
 * @throws {ScopeError} @en When the registry has not been initialized. @zh registry 未初始化时抛出。
 *
 * @example
 * resolve("math.sum") // => FormulaInstance
 */
```

Optional tags — add only when applicable:

```ts
 * @sideeffect @en Writes the result to the in-memory registry cache. @zh 将结果写入内存 registry 缓存。
 * @mutates @en Modifies `ctx.registry` in place. @zh 直接修改 `ctx.registry`。
```

### Interface / Type alias

```ts
/**
 * @en Options passed to the formula compiler at build time.
 * @zh 构建时传入公式编译器的选项。
 */
export interface CompileOptions {
  /** @en Enable strict type checking for formula inputs. @zh 对公式输入启用严格类型检查。 */
  strict: boolean;
}
```

---

## Other languages

Apply the same bilingual rules (`[EN]` / `[ZH]` inline) using each language's native convention:

| Language | Convention | Notes |
|----------|------------|-------|
| Python | Google docstring | `[EN]` / `[ZH]` inline per field |
| Go | godoc | EN first line, `// [ZH] ...` second line; no `[async]` |
| Java / Kotlin | Javadoc | `@en` / `@zh` mirroring JSDoc style |
| Rust | rustdoc `///` | `# Errors`, `# Examples` required; `# Panics` only if applicable |
