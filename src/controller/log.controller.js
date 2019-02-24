var log4js  = require('log4js');

log4js.configure({
    appenders: {
        mail_jobs: { type: 'file', filename: 'public/Logs/Mail/mail-jobs.log', maxLogSize: 990485760, backups: 20},
        error_log: { type: 'file', filename: 'public/Logs/Error/error.log', maxLogSize: 10485760, backups: 10},
        hit_log: { type: 'file', filename: 'public/Logs/Hits/hit.log', maxLogSize: 990485760, backups: 20}
    },
    categories: {
        default: { appenders: [ 'mail_jobs' ], level: 'debug' },
        error_log: { appenders: [ 'error_log' ], level: 'debug' },
        hit_log: { appenders: [ 'hit_log' ], level: 'debug' }
    }
});

const logger = log4js;
module.exports = logger;