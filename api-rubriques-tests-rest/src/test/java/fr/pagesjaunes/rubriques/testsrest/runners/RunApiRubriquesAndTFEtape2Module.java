package fr.pagesjaunes.rubriques.testsrest.runners;

import org.junit.runner.RunWith;

import fr.pagesjaunes.socle.technique.testsautos.annotations.Etape;
import fr.pagesjaunes.socle.technique.testsautos.restassured.utils.RestAssuredRunnerEtape;
import fr.pagesjaunes.socle.technique.testsautos.utils.PJTestPackageToScan;

/**
 * Runner utilisé pour lancer tous les tests qui comporte les annotations Module. Ce runner
 * est utilisé par la chaine de CD lors de l'étape n°2 et permet d'exécuter tous les tests du module pour cette
 * application.
 *
 */
@RunWith(RestAssuredRunnerEtape.class)
@PJTestPackageToScan(basePackage = "fr.pagesjaunes.rubriques.testsrest.tests")
@Etape(type = Etape.ETAPE2)
public class RunApiRubriquesAndTFEtape2Module {
}
