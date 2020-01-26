const express = require('express');

const accountRouter = function(config, log) {
    const accountController = require('../controllers/accountController')(config, log);
    const router = express.Router();

    router.route('/')
        .post(accountController.createAccount)
        .put(accountController.updateAccount);

    return router;
}

module.exports = accountRouter;