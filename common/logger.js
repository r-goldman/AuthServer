const log4js = require('log4js');

const logger = {
  debug = function(file, method, message) {

  },
  info = function(file, method, message) {
    console.log(`${file}.${method} ${message}`)
  },
  error = function(file, method, message) {
    console.console.error(`${file}.${method} ${message}`)
  }
};

module.exports = logger;
