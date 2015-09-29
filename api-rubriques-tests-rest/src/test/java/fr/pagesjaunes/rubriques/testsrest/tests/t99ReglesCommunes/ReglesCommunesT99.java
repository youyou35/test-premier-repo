package fr.pagesjaunes.rubriques.testsrest.tests.t99ReglesCommunes;

import org.junit.BeforeClass;
import org.slf4j.LoggerFactory;

import fr.pagesjaunes.commun.core.test.TestContext;
import fr.pagesjaunes.socle.technique.plateforme.Plateforme;
import fr.pagesjaunes.socle.technique.testsautos.restassured.test.AbstractReglesCommunesTF;

/**
 * T99 : Règles Communes.
 *
 */

public class ReglesCommunesT99 extends AbstractReglesCommunesTF {

    public ReglesCommunesT99() {
        super(Plateforme.getProperty("CONFPJ_APIRUBRIQUES_V2_CONTEXT"));
    }

    /** Avant les tests. */
    @BeforeClass
    public static void beforeClass() {
        logger = LoggerFactory.getLogger(ReglesCommunesT99.class);
        TestContext.init();
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public void initialisation() {

        //Récupérer les rubriques de type outils
        this.addGet("/rubriques");

        //Récupérer la conf
        this.addGet("/supervision");

        //Afficher les smoketest
        this.addGet("/smokeTest");

    }
}
