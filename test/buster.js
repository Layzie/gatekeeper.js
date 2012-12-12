var config = module.exports;

config['GatekeeperTest'] = {
  env: 'browser',
  rootPath: '../',
  sources: ['./src/*.coffee'],
  tests: ['test/*-test.coffee'],
  extensions: [require("buster-coffee")]
};
