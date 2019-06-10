module.exports = {
  testEnvironment: 'node',
  setupFiles: ['dotenv/config'],
  transform: {
    '.js$': 'babel-jest',
  },
}
