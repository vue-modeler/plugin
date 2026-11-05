const branch = process.env.GITHUB_REF_NAME ?? ''
const isPrereleaseBranch = branch === 'beta'

/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: [
    'main',
    { name: 'beta', prerelease: true },
  ],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits',
        releaseRules: [
          { scope: 'no-release', release: false },
          { type: 'release', release: 'patch' },
        ],
        parserOpts: {
          noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
        },
        mergeCommits: true,
        mergeCommitParser: 'conventionalCommits',
      },
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
      },
    ],
    ...(isPrereleaseBranch ? [] : ['@semantic-release/changelog']),
    '@semantic-release/npm',
    '@semantic-release/github',
    '@semantic-release/git',
  ],
}
