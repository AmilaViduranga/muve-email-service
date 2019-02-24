var DebugModuler  = require('./log.controller');
var sgMail        = require('@sendgrid/mail');
var service       = require('../services/data.service');
var fs            = require('fs');

var MailLog       = DebugModuler.getLogger("mail_jobs");
var ErrorLog      = DebugModuler.getLogger("error_log");

var MailController = function() {
    this.sendMail = (attachments, receivers, templateName, dyanamicContents) => {
        return new Promise((resolve, reject) => {
            service.getHostDetails().then(data => {
                let dataReceived = JSON.parse(data);
                let templateId;
                switch (templateName) {
                    case 'default':
                        templateId = "d-a1423801564a4131a03647ef2980c191";
                        break;
                }
                sgMail.setApiKey(dataReceived.key);
                if(attachments.length != 0) {
                    this.readAttachment(attachments).then(afterReadAttachments => {
                        if(receivers.length != 0) {
                            receivers.forEach(sender => {
                                let dyanamicContent = {};
                                dyanamicContents.forEach(content => {
                                    if(content.email == sender) {
                                        dyanamicContent = content;
                                    }
                                })
                                let msg = {
                                    to: sender,
                                    from: 'muve@muve.com',
                                    templateId: templateId,
                                    attachments: afterReadAttachments,
                                    dynamic_template_data: dyanamicContent
                                }
                                sgMail.send(msg).then(data => {
                                    MailLog.info("Email has sent to " + sender + " successfully. Template type:- " + templateName);
                                    resolve(data);
                                }).catch(err => {
                                    ErrorLog.error("Email send is failed to " + sender + ", due to error:- " + err);
                                    reject(err);
                                }) 
                            })
                        }
                    })          
                } else {
                    receivers.forEach(sender => {
                        let dyanamicContent = {};
                        dyanamicContents.forEach(content => {
                            if(content.email == sender) {
                                dyanamicContent = content;
                            }
                        })
                        let msg = {
                            to: sender,
                            from: 'muve@muve.com',
                            templateId: templateId,
                            dynamic_template_data: dyanamicContent
                        }
                        sgMail.send(msg).then(data => {
                            MailLog.info("Email has sent to " + sender + " successfully");
                            resolve(data);
                        }).catch(err => {
                            ErrorLog.error("Email send is failed to " + sender + ", due to error:- " + err);
                            reject(err);
                        }) 
                    })
                }
            }).catch(err => {
                ErrorLog.error("Error:- " + err);
                reject(err);
            })
        })
    }

    this.readAttachment = function(attachments) {
        return new Promise((resolve, reject) => {
            if(attachments.length != 0) {
                let attachmentAfterRead = [];
                attachments.forEach(attachment => {
                    fs.readFile("public/attachments/" + attachment.name, function(err, content) {
                        if(err) {
                            ErrorLog.error("Error:- " + err);
                            reject(err);
                        } else {
                            let base64data = Buffer.from(content).toString("base64");
                            attachmentAfterRead.push({
                                filename: attachment.displayName,
                                content: base64data
                            })
                            resolve(attachmentAfterRead);
                        }
                    })
                })
            }
        })
    }
}

module.exports = new MailController();