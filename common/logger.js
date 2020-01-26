const log4js = require('log4js'),
      stringify = require('safe-json-stringify');

const initLogger = function(config) {
  // Configure log4js
  log4js.configure({
    appenders: {
      console: { type: 'stdout', layout: {
        type: 'coloured'
      }}, 
      rollingFile: { type: 'dateFile', filename: config['LOG_FILE'], daysToKeep: 14, layout: {
        type: 'pattern',
        pattern: '%d{ISO8601_WITH_TZ_OFFSET} %z [%p] %m'
      }}
    },
    categories: {
      default: { appenders: ['rollingFile'], level: 'TRACE' },
      console: { appenders: ['console'], level: 'TRACE' }
    }
  });

  // Create logger
  const log = log4js.getLogger();
  log.level = config['LOG_LEVEL'];

  // Format log input
  const getMessage = function(file, method, msg) {
    let prefix = `${file}.${method}() - `;

    let message = '';
    if (typeof msg != 'object') {
      message = msg;
    }
    else if (msg instanceof Error) {
      message = msg.name + ' : ' + msg.message;
    }
    else if (msg) {
      message = stringify(msg);
    }

    return prefix + message;
  }

  // Define logger object
  const logger = {
    trace: function(file, method, message) {
      log.trace( getMessage(file, method, message) );
    },
    debug: function(file, method, message) {
      log.debug( getMessage(file, method, message) );
    },
    info: function(file, method, message) {
      log.info( getMessage(file, method, message) );
    },
    warn: function(file, method, message) {
      log.warn( getMessage(file, method, message) );
    },
    error: function(file, method, message) {
      log.error( getMessage(file, method, message) );
    },
    fatal: function(file, method, message) {
      log.fatal( getMessage(file, method, message) );
    }
  };

  return logger;
};

module.exports = initLogger;
