package fr.pagesjaunes.rubriques.testsrest.tests.t03thematiques;


import static com.jayway.restassured.RestAssured.given;

import org.hamcrest.Matchers;
import org.junit.BeforeClass;
import org.junit.Test;
import org.slf4j.LoggerFactory;

import com.jayway.restassured.response.Response;

import fr.pagesjaunes.commun.core.test.TestContext;
import fr.pagesjaunes.rubriques.testsrest.tests.AbstractRubriquesTF;
import fr.pagesjaunes.socle.technique.testsautos.annotations.Etape;
import fr.pagesjaunes.socle.technique.testsautos.annotations.Etapes;

/**
 * RUBRIQUES-T03-F01 : Tests résultats précis et ciblés.
 */
public class T03F01InterfaceThematiques extends AbstractRubriquesTF {

	/** Avant les tests. */
    @BeforeClass
    public static void beforeClass() {
        TestContext.init();
        logger = LoggerFactory.getLogger(T03F01InterfaceThematiques.class);
    }

    /**.
     * T03-F01-EX0100	: Liste des thématiques publicitaires
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT03F01EX0100Thematiques() {
    	StringBuilder builder = new StringBuilder(ROOT_PATH_THEMATIQUES);

        Response reponse = given().get(builder.toString());

        reponse.then()
	        .statusCode(200)
	        .body("code", Matchers.notNullValue())
			.body("libelle", Matchers.not(Matchers.empty()));
    }

}
