package fr.pagesjaunes.rubriques.testsrest.tests;

import fr.pagesjaunes.socle.technique.plateforme.Plateforme;
import fr.pagesjaunes.socle.technique.testsautos.restassured.test.AbstractTestRestAssured;

/**
 * Classe abstraite qui permet d'initialiser le context pour l'api geo.
 *
 */
public abstract class AbstractRubriquesTF extends AbstractTestRestAssured {

	protected static final String ROOT_PATH_RUBRIQUES = "/rubriques";
	protected static final String ROOT_PATH_SEGMENTS = "/segments";
	protected static final String ROOT_PATH_THEMATIQUES = "/thematiques";

    /**
     * Constructeur qui permet de définir le context de l'api rubriques.
     */
    public AbstractRubriquesTF() {
        super(Plateforme.getProperty("CONFPJ_APIRUBRIQUES_V2_CONTEXT"));
    }

}
