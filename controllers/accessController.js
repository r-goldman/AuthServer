const AWS = require('aws-sdk'),
      AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const accessController = function (config, log) {
  const poolData = {
    UserPoolId : config['COGNITO_POOL_ID'],
    ClientId : config['COGNITO_CLIENT_ID']
  };

  /**
   * Returns an OAuth token given basic auth credentials
   * 
   * @param {*} req.headers.authorization 
   */
  const login = async function(req, res, next) {
    try {
      log.info('accessController', 'login', 'start');

      if (!req.auth) {
        res.status(400);
        res.json({error: 'Missing Authorization header'});
        return;
      }
      else if (req.auth.type !== 'BASIC' || !req.auth.username || !req.auth.password) {
        res.status(400);
        res.json({'error': 'Invalid Authorization header'});
        return;
      }

      let authenticationData = {
        Username : req.auth.username,
        Password : req.auth.password,
      };
      const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

      let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
      let userData = {
          Username : req.auth.username,
          Pool : userPool
      };
      let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
      cognitoUser.authenticateUser(authenticationDetails, {
          onSuccess: function (result) {
            let accessToken = result.getAccessToken().getJwtToken();
            let idToken = result.getIdToken().getJwtToken();
            let refreshToken = result.getRefreshToken().getToken();

            log.info('accessController', 'login', 'success');
            res.status(200);
            res.json({token: idToken, refresh: refreshToken});
          },
          onFailure: function(err) {
            log.info('accessController', 'login', err);
            log.info('accessController', 'login', 'failure');
            res.status(400);
            res.json({error: 'Invalid credentials'});
          }
      });
    }
    catch(err) {
      log.error('accessController', 'login', err);
      res.status(500);
      res.json({error: 'Internal Server Error'});
    }
  }

  const logout = async function(req, res, next) {
    res.status(418);
    res.send('Not Implemented');
  }

  const refreshToken = async function(req, res, next) {
    res.status(418);
    res.send('Not Implemented');
  }

  return {
    login: login,
    logout: logout,
    refreshToken: refreshToken
  }
}

module.exports = accessController;