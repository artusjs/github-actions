const core = require('@actions/core');
const { getExecOutput } = require('@actions/exec');
const semanticRelease = require('semantic-release');

async function execGit(cmd) {
  const { stdout } = await getExecOutput(cmd);
  return stdout.trim();
}

async function run() {
  const pkgInfo = require(`${process.cwd()}/package.json`);
  const registry = pkgInfo.publishConfig?.registry || 'https://registry.npmjs.org';
  core.setOutput('name', pkgInfo.name);
  core.setOutput('registry', registry);

  const lastCommitId = await execGit(`git log -n1 --format="%h"`);

  try {
    const result = await semanticRelease({
      dryRun: process.env.DRYRUN === 'true',
    });

    const { nextRelease, lastRelease } = result;

    if (!nextRelease) {
      core.notice('No release need to be published.');
      core.summary.addRaw('No release need to be published.');
      await core.summary.write();
    } else {
      core.info(`Published release: ${nextRelease.version}`);
      core.setOutput('release_version', nextRelease.version);

      core.summary.addRaw(`## [${pkgInfo.name}](https://github.com/${process.env.GITHUB_REPOSITORY})\n`);
      core.summary.addRaw(`- Release: ${lastRelease?.version ?? ''} -> ${nextRelease.version}\n`);
      core.summary.addRaw(`- Registry: ${registry}\n`);
      core.summary.addRaw(`- DryRun: ${process.env.DRYRUN}\n`);
      core.summary.addRaw(nextRelease.notes);
      await core.summary.write();
    }
    console.log('Result:', result);
  } catch (error) {
    console.error('> Rollback to last commit');
    const currentCommitId = await execGit(`git log -n1 --format="%h"`);
    const tagId = await execGit(`git tag --contains ${currentCommitId}`);

    await execGit(`git push --delete origin ${tagId}`);
    await execGit(`git reset --hard ${lastCommitId}`);
    await execGit(`git push --force`);

    console.error('> Rollback finished');

    // console.error(error);
    core.setFailed(error);
  }
}

run();
