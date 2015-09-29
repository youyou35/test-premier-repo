package fr.pagesjaunes.rubriques.testsrest.tests.t03thematiques;


import static com.jayway.restassured.RestAssured.given;

import org.hamcrest.Matchers;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.LoggerFactory;

import com.jayway.restassured.path.json.JsonPath;
import com.jayway.restassured.response.Response;

import fr.pagesjaunes.commun.core.test.TestContext;
import fr.pagesjaunes.rubriques.testsrest.tests.AbstractRubriquesTF;
import fr.pagesjaunes.socle.technique.testsautos.annotations.Etape;
import fr.pagesjaunes.socle.technique.testsautos.annotations.Etapes;

/**
 * RUBRIQUES-T03-F03 : Tests résultats précis et ciblés.
 */
public class T03F03InterfaceThematiques extends AbstractRubriquesTF {

    private static String codePub = "";
    private static String libPub = "";

	/** Avant les tests. */
    @BeforeClass
    public static void beforeClass() {
        TestContext.init();
        logger = LoggerFactory.getLogger(T03F03InterfaceThematiques.class);
    }

    @Before
    /**
     * Récupère des infos sur une thematique pub
     * Permet d'utiliser les infos en question en entrée dans la suite des tests
     */
    public void getThematique() {
        StringBuilder builder = new StringBuilder(ROOT_PATH_THEMATIQUES);
        builder.append("?offset=0&limit=1");
    	String strReponse = given().get(builder.toString()).asString();
        JsonPath jsonResponse = new JsonPath(strReponse);
        T03F03InterfaceThematiques.codePub = jsonResponse.get("[0].code");
        T03F03InterfaceThematiques.libPub = jsonResponse.get("[0].libelle");
    }

    /**.
     * T03-F03-EX0100	: Rubriques par code thématiques publicitaires
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT03T03EX0100RubriquesParCodeThematique() {
    	StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);

        Response reponse = given().param("code_thematique",codePub).get(builder.toString());

        reponse.then()
	        .statusCode(200)
    		.body("[0].thematique_publicitaire.code", Matchers.equalTo(codePub))
			.body("libelle", Matchers.not(Matchers.empty()));
    }

    /**.
     * T03-F03-EX0200	: Rubriques libelle thématiques publicitaires
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT03F03EX0200RubriquesParLibelleThematique() {
    	StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);

        Response reponse = given().param("libelle_thematique",libPub).get(builder.toString());

        reponse.then()
	        .statusCode(200)
    		.body("[0].thematique_publicitaire.libelle", Matchers.equalTo(libPub))
			.body("code", Matchers.not(Matchers.empty()));
    }
}
