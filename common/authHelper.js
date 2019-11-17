const jwtDecode = require('TODO-jwt-package');

const authHelper = {
  decode = function(rawToken) {
    if (!rawToken)
      return null;

    let splitToken = rawToken.split(' ');
    if (splitToken.length != 2)
      return null;

    let decodedToken = {
      type: splitToken[0].toUpperCase()
    };

    if (decodedToken.type == 'BASIC')
      decodedToken.value = {new Buffer(splitToken[1], 'base64').toString('ascii');
    else if (decodedToken.type == 'BEARER')
      decodedToken.value = jwtDecode(splitToken[1]);

    return decodeToken;
  }
};

module.exports = authHelper;
