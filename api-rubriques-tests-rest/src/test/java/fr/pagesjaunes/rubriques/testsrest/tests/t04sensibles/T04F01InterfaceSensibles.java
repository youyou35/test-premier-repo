package fr.pagesjaunes.rubriques.testsrest.tests.t04sensibles;


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
 * RUBRIQUES-T03-F03 : Tests résultats précis et ciblés.
 */
public class T04F01InterfaceSensibles extends AbstractRubriquesTF {

	/** Avant les tests. */
    @BeforeClass
    public static void beforeClass() {
        TestContext.init();
        logger = LoggerFactory.getLogger(T04F01InterfaceSensibles.class);
    }

    /**.
     * T04-F01-EX0100	: Rubriques sensibles
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT04F01EX0100RubriquesSensibles() {
    	StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);
    	builder.append("/sensibles");
        Response reponse = given().param("limit",100).get(builder.toString());

        reponse.then()
	        .statusCode(206)
    		.body("[0].code_AN8", Matchers.not(Matchers.empty()));
    }

}
