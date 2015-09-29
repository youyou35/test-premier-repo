/**
 * Gestion de la conf
 * Permet d'interpréter les données issues d'un objet comme des variables d'environnement
 * Note : mécanisme requis par le Continuous Delivery.
 * Choix d'un Handler spécifique pour permettre à nouveau une lecture de conf "normale" en cas
 * d'évolution, sans impact sur le reste du code.
 */
function ConfHandler(pConfObject){

	// Contient l'objet json décrivant la conf
    var _conf = pConfObject;

    // Interprète un chemin "json" pour découvrir le nom
    // d'une variable d'environnement dans l'objet _conf
    // Une fois le nom trouvé, la variable est interprétée et c'est sa valeur qui est retournée.
    // Si l'interprétaion du nom en tant que variable ne donne rien on retourne la valeur directe
    this.get = function(pJsonPath){
        arrayPath = pJsonPath.split('.');
        rEnvName = _conf;
        for(var i=0;i<arrayPath.length;i++){
            rEnvName = rEnvName[arrayPath[i]];
        }
		// Interprétation de la variable trouvée
		// Si aucune variable d'environnement n'est définie pour ce nom, on retourne le nom seul
        return (process.env[rEnvName] || rEnvName);
    };
}

module.exports = ConfHandler;
