const express = require('express'),
      bodyParser = require('body-parser'),
      fetch = require('node-fetch'),
      fs = require('fs'),
      https = require('https'),
      config = require('config');
const log = require('./common/logger')(config),
      tokenHelper = require('./common/tokenHelper')(log);

global.fetch = fetch;

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(tokenHelper.parseToken);

const accountRouter = require('./routes/accountRouter')(config, log);
const accessRouter = require('./routes/accessRouter')(config, log);

app.use('/api/accounts', accountRouter);
app.use('/api/access', accessRouter);

app.use(function(req, res) {
    console.error(err.stack);
    log.error('app', 'noResponse', 'uncaught exception');
    res.status(500);
    res.json({error: 'Internal Server Error'});
});
process.on('uncaughtException', function(err, origin) {
    console.log('Uncaught Exception!');
    log.error('app', 'uncaughtException', err);
    process.exit(-1);
});
process.on('unhandledRejection', function(reason, promise) {
    console.log('Uhandled Rejection!');
    log.error('app', 'unhandledRejection', reason);
    process.exit(-1);
});

let port = config['SERVER_PORT'];
let certificateKeyFile = config['CERTIFICATE_KEY_FILE'];
let certifcateFile = config['CERTIFICATE_FILE'];

if (certificateKeyFile && certifcateFile) {
    const options = {
        key: fs.readFileSync(certificateKeyFile),
        cert: fs.readFileSync(certifcateFile)
    };
    https.createServer(options, app).listen(port, function() {
        console.log('RUNNING SECURELY on port ' + port);
        log.info('app', 'listen', 'SERVER STARTUP on port ' + port);
    });
}
else { // Run in http
    app.listen(port, function() {
        console.log('RUNNING on port ' + port);
        log.info('app', 'listen', 'SERVER STARTUP on port ' + port);
    });
}