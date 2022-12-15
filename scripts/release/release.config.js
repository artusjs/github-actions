module.exports = {
  plugins: [
    [ '@semantic-release/commit-analyzer', { preset: 'conventionalcommits' } ],
    [ '@semantic-release/release-notes-generator', { preset: 'conventionalcommits' } ],
    [ '@semantic-release/changelog', { changelogTitle: '# Changelog' } ],
    [ '@semantic-release/npm', {} ],

    // [ '@semantic-release/exec', {
    //   'publishCmd': 'ls -l dist && ls -l .semantic-release && tar -ztvf .semantic-release/*.tgz',
    // } ],

    [ '@semantic-release/git',
      {
        message: 'Release <%= nextRelease.version %>\n\n[skip ci]\n\n<%= nextRelease.notes %>',
      },
    ],

    [{
      fail: function (...args) {
        console.log('Hello World!', args);
      }
    }],

    [ '@semantic-release/github',
      {
        addReleases: 'bottom',
      },
    ],
  ],
};
