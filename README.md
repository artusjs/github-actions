# artusjs/github-actions

为开源项目提供常见的可复用的 [GitHub Actions Workflow](https://docs.github.com/en/actions/using-workflows/reusing-workflows#using-inputs-and-secrets-in-a-reusable-workflow)。

## 功能列表

- [x] 单元测试
- [x] 自动发包
- [ ] 自动初始化仓库配置

## 单元测试

自动跑 Lint 和 Cov 单测

> 参考示例：https://github.com/artus-cli/examples/actions


- 配置 `npm scripts`：

```json
{
  "name": "your-project",
  "scripts": {
    "lint": "eslint .",
    "test": "mocha",
    "ci": "c8 npm test"
  }
}
```

- 创建 `.github/workflows/ci.yml`：

```yaml
name: CI

on:
  push:
    branches: [ master, main ]

  pull_request:
    branches: [ master, main, next, beta, '*.x' ]

  schedule:
    - cron: '0 2 * * *'

  workflow_dispatch: {}

jobs:
  Job:
    name: Node.js
    uses: artusjs/github-actions/.github/workflows/node-test.yml@v1
    # 支持以下自定义配置，一般用默认值即可
    # with:
    #   os: 'ubuntu-latest, macos-latest, windows-latest'
    #   version: '16, 18'
```

## 发布 NPM 包

使用 [semantic-release](https://semantic-release.gitbook.io/) 自动发布 NPM 包。

### 功能详情

- 根据 Git 日志自动计算版本号
- 自动生成 ChangeLog 文件
- 自动创建 GitHub Release 说明
- 自动打 Tag 标签
- 自动发布到 Registry，支持 NPM 和 GitHub
- 自动触发 CNPM 同步

支持合并到主干分支后自动发布，也支持手动发布。

> **手动发布方式**：访问仓库的 Actions 页面，左侧选择 Release Workflow，点击右侧的 `Run Workflow` 即可。

### 版本号规则

根据 Commit Message 自动计算下一个版本号：
  - major 大版本：`BREAKING CHANGE`，必须加到 commit body 里面而不是第一行标题，否则不生效
  - minor 特性版本： `feat:` 等
  - patch 补丁版本：`fix:` 等
  - 不发布版本： `chore:` / `docs:` / `style:` 等
  - 详见：https://github.com/semantic-release/commit-analyzer

**注意：**
  - 不支持发布 0.x 版本，master 首次发布将是 1.0.0 版本
  - 如果你不期望直接发布，请在 beta 分支提交代码运行，将发布 `1.0.0-beta.1` 版本
  - 多版本发布实践参见 [semantic-release](https://semantic-release.gitbook.io/semantic-release/recipes/release-workflow/distribution-channels) 文档


### 配置方式

- 创建 NPM Token
  - NPM Registry 需创建 Automation Token，参见[文档](https://docs.npmjs.com/creating-and-viewing-access-tokens)
  - GitHub Package 无需创建，默认支持

- 创建 GitHub Token
  - 因为生成的 CHANGELOG.md 和 package.json 需回写 GitHub，而默认的 `GITHUB_TOKEN` 没有该权限
  - 因此需要创建一个新的 Token，参见[文档](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)

- 配置 Token
  - 在项目或组织维度配置 2 个 `secrets`：`NPM_TOKEN` 和 `GIT_TOKEN`
  - 参见[文档](https://docs.github.com/en/codespaces/managing-codespaces-for-your-organization/managing-encrypted-secrets-for-your-repository-and-organization-for-github-codespaces)

- 创建 `.github/workflows/release.yml`：

```yaml
name: Release
on:
  # 合并后自动发布
  push:
    branches: [ master, main, next, beta, '*.x' ]

  # 手动发布
  workflow_dispatch: {}

jobs:
  release:
    name: Node.js
    uses: artusjs/github-actions/.github/workflows/node-release.yml@v1
    secrets:
      NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
    # with:
      # checkTest: false
      # dryRun: true
```

### 发布到 GitHub Package

修改 `release.yml` 的 secrets：

```yaml
secrets:
  NPM_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

修改 `package.json`：

```json
{
  "publishConfig": {
    "access": "public",
    "registry": "https://npm.pkg.github.com"
  },
}
```
