/**
 * REST response handler
 */
 var logger = require('../logger.js');

function ResponseHandler(){

    /**
     * Formate et envoie une réponse au client
     *
     * @param pErr Si défini, l'erreur est renvoyée au client
     * @param pData L'objet contenant les données renvoyées au client
     * @param pResult Response object
     * @param pSuccessCode Code retour associée à la réponse
     * @param pMetaInfo (optional) Si défini, pData est ajouté à l'objet et retourné au client
     */
    this.sendResponse = function(pErr, pData, pRequest, pResult, pCode, pMessage, pMetaInfo) {
        // Format standard de la réponse
        content = {
                    status:{
                        statusContent:[
                        {
                            code:pCode,
                            message:pMessage
                        }]
                    }
                };
        code = pCode;

        if (pErr) {
            logger.getInstance().debug("sendResponse : Error server");
            // Si on a une erreur, on compile les infos relatives dans "content"
            content.status.statusContent[0].code = "500 - " + pMessage;
            content.status.statusContent[0].message = pErr.message;
            code = 500;
            logger.getInstance().error('Technical error ' + pErr.message + ' / ' + pMessage);
        } else {
            if (pData === null || pData.length <= 0) {
                // Fixme : on devrait avoir une 204 ici (non data), mais il faut une version nodejs >= 0.10.6
                content.status.statusContent[0].code = "404 - Resource not found (" + pMessage +")";
                content.status.statusContent[0].message = "Resource not found";
                code = 404;
                logger.getInstance().info('Resource not found ' + pMessage);
            }else{
                logger.getInstance().debug("sendResponse : "+pMessage);

                pResult.set('Cache-Control', 'max-age=3600');
                if (pMetaInfo){
                    logger.getInstance().debug('sendResponse : Meta info demandée');
                    pMetaInfo._ressource = pData;
                    content = pMetaInfo;
                } else {
                    if (pData){
                        logger.getInstance().debug('sendResponse : '+JSON.stringify(pData));
                        content = pData;
                    }else{
                        logger.getInstance().debug('sendResponse : Pas de données ...');
                    }
                }
            }
        }

        logger.getInstance().debug('restHandler.js : On répond '+ code);

        try {
            pResult.status(code).send(content);
        } catch(err) {
            logger.getInstance().error("restHandler.js : error lors de l'envoi de la réponse");
            logger.getInstance().error("restHandler.js : content => "+JSON.stringify(content));
            logger.getInstance().error("restHandler.js : code => "+code);
            logger.getInstance().error(err);
        }
        
    };
}

module.exports = ResponseHandler;
