package fr.pagesjaunes.rubriques.testsrest.tests.t01rubriques;
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
 * RUBRIQUES-T01-F01 : Tests résultats précis et ciblés.
 */
public class T01F01InterfaceRubriques extends AbstractRubriquesTF {

	/** Avant les tests. */
    @BeforeClass
    public static void beforeClass() {
        TestContext.init();
        logger = LoggerFactory.getLogger(T01F01InterfaceRubriques.class);
    }

    /**
     * T01-F01-EX0100	: Liste des rubriques
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT01F01EX0100Rubriques() {
    	StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);

        Response reponse = given().get(builder.toString());
        reponse.then()
                .statusCode(206)
                .body("", Matchers.notNullValue());
    }

    /**
     * T01-F01-EX0100 : Liste des criteres paginée
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT01F01EX0100RubriquesPagination() {
    	StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);

    	builder.append("?offset=0&limit=10&meta");
        Response reponse = given().get(builder.toString());
        reponse.then()
                .statusCode(206)
                .body("", Matchers.notNullValue());
    }

}
