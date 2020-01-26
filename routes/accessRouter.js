const express = require('express');

const accessRouter = function(config, log) {
    const accessController = require('../controllers/accessController')(config, log);
    const router = express.Router();

    router.route('/')
        .get(accessController.login)
        .patch(accessController.refreshToken)
        .delete(accessController.logout);

    return router;
}

module.exports = accessRouter;