const jwt = require('jsonwebtoken');

const tokenHelper = function(log) {

  const parseToken = function(req, res, next) {
    try {
      log.info('tokenHelper', 'parseToken', 'start');
      if (!req.headers['authorization']) {
        log.info('tokenHelper', 'parseToken', 'missing header');
        next();
        return;
      }

      let splitToken = req.headers['authorization'].split(' ');
      let decoded = {
        type: splitToken[0].toUpperCase()
      };
      log.debug('tokenHelper', 'parseToken', `called with ${decoded.type} token`);

      if (decoded.type == 'BASIC') {
        if (splitToken.length > 1) {
          decoded.token = Buffer.from(splitToken[1], 'base64').toString('ascii');
          let unameAndPwrd = decoded.token.split(':');
          decoded.username = decodeURIComponent(unameAndPwrd[0]);
          if (unameAndPwrd.length > 1)
            decoded.password = decodeURIComponent(unameAndPwrd[1]);
        }
      }
      else if (decoded.type == 'BEARER')
        decoded.token = jwt.decode(splitToken[1], {json: true});
      else
        decoded.token = splitToken[1];

      req.auth = decoded;

      log.info('tokenHelper', 'parseToken', 'success');
      next();
    }
    catch(err) {
      log.error('tokenHelper', 'parseToken', err);
      next();
    }
  }

  return {
    parseToken: parseToken
  }
};

module.exports = tokenHelper;
