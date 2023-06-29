module.exports = {
  snapshotDir: 'test/.snapshots',
  failFast: true,
  extensions: {
    ts: 'module'
  },
  nodeArguments: ['--loader=tsx', '--no-warnings'],
  timeout: '30s'
}
