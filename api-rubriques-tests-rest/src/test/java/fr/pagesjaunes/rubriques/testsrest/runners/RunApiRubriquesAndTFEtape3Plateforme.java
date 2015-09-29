package fr.pagesjaunes.rubriques.testsrest.runners;

import org.junit.runner.RunWith;

import fr.pagesjaunes.socle.technique.testsautos.annotations.Etape;
import fr.pagesjaunes.socle.technique.testsautos.restassured.utils.RestAssuredRunnerEtape;
import fr.pagesjaunes.socle.technique.testsautos.utils.PJTestPackageToScan;

/**
 * Runner utilisé pour lancer tous les tests qui comporte les annotations Plateforme. Ce
 * runner est utilisé par la chaine de CD lors de l'étape n°3 et permet d'exécuter tous les tests de plateforme pour
 * cette application.
 *
 */
@RunWith(RestAssuredRunnerEtape.class)
@PJTestPackageToScan(basePackage = "fr.pagesjaunes.rubriques.testsrest.tests")
@Etape(type = Etape.ETAPE3)
public final class RunApiRubriquesAndTFEtape3Plateforme {

}
