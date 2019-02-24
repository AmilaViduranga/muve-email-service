var express         = require('express');
var MailController  = require("../controller/mail.controller");
var router          = express.Router();
var amqp            = require('amqplib/callback_api');
var service         = require('../services/data.service');
var DebugModuler    = require('../controller/log.controller');

var HitLog          = DebugModuler.getLogger("hit_log");
var ErrorLog        = DebugModuler.getLogger("error_log");

router.post('/send-email', function(req, res) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    HitLog.info("Hit:-" + ip);
    service.getHostDetails().then(data => {
        let dataReceived = JSON.parse(data);
        const credentials = { credentials: require('amqplib').credentials.plain(dataReceived.rabbitMq.user, dataReceived.rabbitMq.password) };
        amqp.connect('amqp://localhost', credentials, function(err, conn) {
            conn.createChannel(function(err, ch) {
                if(err) {
                    ErrorLog.error("Error:- " + err);
                    res.status(500).send({message: "Error:-" + err});
                } else {
                    var queue = 'email_queue';
                    ch.assertQueue(queue, {durable: false});
                    let data = JSON.stringify(req.body);
                    ch.sendToQueue(queue, new Buffer(data));
                    res.status(200).send({message: "Successfully loaded emails"});
                }
            });
        });

        amqp.connect('amqp://localhost', credentials , function(err, conn) {
            conn.createChannel(function(err, ch) {
                if(err) {
                    ErrorLog.error("Error:- " + err);
                } else {
                    var queue = 'email_queue';
                    ch.assertQueue(queue, {durable: false});
                    ch.consume(queue, function(msg) {
                        let queueData = JSON.parse(msg.content.toString());
                        MailController.sendMail(queueData.attachments, queueData.receivers, queueData.templateName, queueData.dyanamicContents).then(data => {
                        return;
                        }).catch(err => {
                            ErrorLog.error("Error:- " + err);
                        })
                    }, {noAck: true});
                }
            });
        });
    }).catch(err => {
        ErrorLog.error("Error:- " + err);
    }) 
})

module.exports = router;