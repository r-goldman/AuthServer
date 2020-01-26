const AmazonCognitoIdentity = require('amazon-cognito-identity-js'),
      AWS = require('aws-sdk');

const accountController = function(config, log) {
    const poolData = {
        UserPoolId : config['COGNITO_POOL_ID'],
        ClientId : config['COGNITO_CLIENT_ID']
    };
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});
    
    /**
     * Creates an account with default permissions
     * 
     * @param {*} req.body.username
     * @param {*} req.body.password 
     * @param {*} req.body.verifyPassword
     * @param {*} req.body.firstName
     * @param {*} req.body.lastName
     * @param {*} req.body.email
     * @param {*} req.body.nickname
     */
    const createAccount = function(req, res, next) {
        try {
            log.info('accountController', 'createAccount', 'start');

            let username = req.body.username;
            let password = req.body.password;
            let verifyPassword = req.body.verifyPassword;
            let firstName = req.body.firstName;
            let lastName = req.body.lastName;
            let email = req.body.email;
            let nickname = req.body.nickname;

            let validationErrors = [];

            if (!username)
                validationErrors.push('Username is required');
            if (!password)
                validationErrors.push('Password is required');
            else if (password !== verifyPassword)
                validationErrors.push('Password and Verify Passowrd do not match');
            if (!firstName)
                validationErrors.push('First Name is required');
            if (!lastName)
                validationErrors.push('Last Name is required');

            if (validationErrors.length > 0) {
                log.info('accountController', 'createAccount', 'bad request');
                res.status(400);
                res.json({errors: validationErrors});
                return;
            }

            let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

            let attributeList = [
                {
                    Name : 'given_name',
                    Value : firstName
                },{
                    Name : 'family_name',
                    Value : lastName
                },{
                    Name : 'email',
                    Value : email
                }
            ];
            if (nickname) attributeList.push({ Name: 'nickname', Value: nickname });
            else attributeList.push({ Name: 'nickname', Value: firstName });

            attributeList.map(x => new AmazonCognitoIdentity.CognitoUserAttribute(x));
            userPool.signUp(username, password, attributeList, null, function(err, result) {
                if (err) {
                    log.info('accountController', 'createAccount', 'unable to create');
                    res.status(400);
                    res.json({error: err.message});
                    return;
                }
                log.info('accountController', 'createAccount', 'success');
                res.status(200);
                return res.json({success: true});
            });
        }
        catch(err) {
            log.error('accountController', 'createAccount', err);
            res.status(500);
            res.json({error: 'Internal Server Error'});
        }
    }

    /**
     * Updates user attributes
     * 
     * @param {*} req.body.firstName
     * @param {*} req.body.lastName
     * @param {*} req.body.email
     * @param {*} req.body.nickname
     * 
     * @param {*} req.headers.authorization
     */
    const updateAccount = function(req, res, next) {
        try {
            log.info('accountController', 'updateAccount', 'start');

            let firstName = req.body.firstName;
            let lastName = req.body.lastName;
            let email = req.body.email;
            let nickname = req.body.nickname;

            let validationErrors = [];
            if (!firstName)
                validationErrors.push('First Name is required');
            if (!lastName)
                validationErrors.push('Last Name is required');
            if (!email)
                validationErrors.push('Email is required');
            if (!nickname)
                validationErrors.push('Nickname is required');

            if (validationErrors.length > 0) {
                log.info('accountController', 'updateAccount', 'bad request');
                res.status(400);
                res.json({errors: validationErrors});
                return;
            }

            let attributeList = [
                {
                    Name : 'given_name',
                    Value : firstName
                },{
                    Name : 'family_name',
                    Value : lastName
                },{
                    Name : 'email',
                    Value : email
                }, {
                    Name : 'nickname',
                    Value : nickname
                }
            ].map(x => new AmazonCognitoIdentity.CognitoUserAttribute(x));

            if (!req.auth || req.auth.type !== 'BEARER' || !req.auth.token) {
                log.info('accountController', 'updateAccount', 'unauthenticated');
                res.status(401);
                res.json({error: 'Unauthenticated'});
                return;
            }
            let userData = {
                Username : req.auth.token['cognito:username'],
                Pool : poolData
            };
            /*let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

            cognitoUser.updateAttributes(attributeList, function(err, result) {
                if (err) {
                    log.info('accountController', 'updateAccount', err);
                    log.info('accountController', 'updateAccount', 'failure');
                    res.status(500);
                    res.json({error: 'Internal Server Error'});
                    return;
                }
                log.info('accountController', 'updateAccount', 'success');
                res.status(200);
                res.json({success: true});
            });*/
            const params = {
                UserAttributes: attributeList,
                UserPoolId: poolData.UserPoolId,
                Username: userData.Username
            };
            const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
            cognitoIdentityServiceProvider.adminUpdateUserAttributes(params, function(err, data) {
                if (err) {
                    console.log(err, err.stack); // an error occurred
                    log.error('accountController', 'updateAccount', err);
                    res.status(500);
                    res.json({error: 'InternalServerError'});
                }
                else {
                    console.log(data);           // successful response
                    log.info('accountController', 'updateAccount', 'success');
                    res.status(200);
                    res.json({success: true});
                }
            });
        }
        catch (err) {
            log.error('accountController', 'updateAccount', err);
            res.status(500);
            res.json({error: 'Internal Server Error'});
        }
    }

    /**
     * Updates user password
     * 
     * @param {*} req.body.oldPassword
     * @param {*} req.body.newPassword
     * @param {*} req.body.verifyPassword
     * 
     * @param {*} req.headers.authorization
     */
    const changePassword = function(req, res, next) {
        res.status(418).send('Not Implemented');
    }

    /**
     * Deletes the authenticated user's account
     * 
     * @param {*} req.headers.authorization 
     */
    const deleteAccount = function(req, res, next) {
        try {
            log.info('accountController', 'deleteAccount', 'start');
            res.status(418).send('Not Implemented');
        }
        catch (err) {
            log.error('accountController', 'deleteAccount', err);
            res.status(500);
            res.json({error: 'Internal Server Error'});
        }
    }

    /**
     * Resends a confirmation email
     * 
     * @param {*} req 
     */
    const sendConfirmation = function(req, res, next) {
        res.status(418).send('Not Implemented');
    }

    /**
     * Sends a reset password link
     * 
     * @param {*} req.body.email
     */
    const forgotPassword = function(req, res, next) {
        res.status(418).send('Not Implemented');
    }

    return {
        createAccount: createAccount,
        updateAccount: updateAccount,
        changePassword: changePassword,
        sendConfirmation: sendConfirmation,
        forgotPassword: forgotPassword,
        deleteAccount: deleteAccount
    }
}

module.exports = accountController;