module.exports = {
  plugins: [
    [ '@semantic-release/commit-analyzer', { preset: 'conventionalcommits' } ],
    [ '@semantic-release/release-notes-generator', { preset: 'conventionalcommits' } ],
    [ '@semantic-release/changelog', { changelogTitle: '# Changelog' } ],
    [ '@semantic-release/npm', {} ],

    [ '@semantic-release/git',
      {
        message: 'Release <%= nextRelease.version %>\n\n[skip ci]\n\n<%= nextRelease.notes %>',
      },
    ],

    [ '@semantic-release/github',
      {
        addReleases: 'bottom',
      },
    ],
  ],
};
