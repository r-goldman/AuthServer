const AWS = require('aws-sdk'),
      AmazonCognitoIdentity = require('amazon-cognito-identity-js'),
      authHelper = require('../common/authHelper');

const loginController = function (config, log) {

  const login = async function(req, res, next) {
    try {
      log.info('cognitoController', 'login', 'start');

      const authHeader = req.headers['authorization'] || '';
      let authToken = authHelper.decode(authHeader);

      if (authToken.type == 'BASIC' && authToken.value) {
        let splitToken = authToken.split(':');
        let authDetails = new AmazonCognitoIdentity.AuthenticationDetails({
          Username : splitToken[0],
          Password : splitToken[1]
        });
        let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

        cognitoUser.authenticateUser(authDetails, {
            onSuccess: function (result) {
              res.status(200);
              res.json({
                accessToken: result.getAccessToken().getJwtToken(),
                idToken: result.getIdToken().getJwtToken(),
                refreshToken: result.getRefreshToken().getToken()
              })
            },
            onFailure: function(err) {
              log.info('cognitoController', 'login', 'end');
              res.status(400);
              res.json({error: 'bad request'});
            }
        });
      }
    }
    catch(err) {
      log.error('cognitoController', 'login', err);
      res.status(500);
      res.json({error: 'Internal Server Error'});
    }
  }

  const logout = async function(req, res, next) {

  }

  const refreshToken = async function(req, res, next) {

  }

  return {
    login: login,
    logout: logout,
    refreshToken: refreshToken
  }

}
