package fr.pagesjaunes.rubriques.testsrest.tests.t01rubriques;
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
 * Rubriques-T01-F01 : Tests résultats précis et ciblés.
 */
public class T01F02InterfaceRubriquesFiltres extends AbstractRubriquesTF {

    private static String codeAn9 = "";
    private static String codeAn8 = "";

	/** Avant les tests. */
    @BeforeClass
    public static void beforeClass() {
        TestContext.init();
        logger = LoggerFactory.getLogger(T01F02InterfaceRubriquesFiltres.class);
    }

    @Before
    /**
     * Récupère des infos sur une rubrique.
     * Permet d'utiliser les infos en question en entrée dans la suite des tests
     */
    public void getRubriqueDataForRubriques(){
        StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);
        builder.append("?offset=0&limit=1");
    	String strReponse = given().get(builder.toString()).asString();
        JsonPath jsonResponse = new JsonPath(strReponse);
        T01F02InterfaceRubriquesFiltres.codeAn9 = jsonResponse.get("[0].code_AN9");
        T01F02InterfaceRubriquesFiltres.codeAn8 = jsonResponse.get("[0].code_AN8");
    }

    /**
     * T01-F02-EX0100 : Liste des Rubriques par an9
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT01F02EX0100RubriquesParAn9(){
        StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);
    	builder.append("/").append(codeAn9);
        Response reponse = given().get(builder.toString());

        reponse.then()
                .statusCode(200)
                .body("code_AN8", Matchers.notNullValue())
        		.body("code_AN8", Matchers.not(Matchers.empty()))
                .body("code_AN9", Matchers.notNullValue())
        		.body("code_AN9", Matchers.not(Matchers.empty()));
    }


    /**
     * T01-F02-EX0200 : Liste des Rubriques par an8
     */
    @Test
    @Etapes({ @Etape(type = Etape.ETAPE2), @Etape(type = Etape.ETAPE3) })
    public void testT01F02EX0200RubriquesParAn8(){
        StringBuilder builder = new StringBuilder(ROOT_PATH_RUBRIQUES);
    	builder.append("/by_code_an8-").append(codeAn8);
        Response reponse = given().get(builder.toString());

        reponse.then()
                .statusCode(200)
                .body("code_AN8", Matchers.notNullValue())
        		.body("code_AN8", Matchers.not(Matchers.empty()))
                .body("code_AN9", Matchers.notNullValue())
        		.body("code_AN9", Matchers.not(Matchers.empty()));
    }

}
