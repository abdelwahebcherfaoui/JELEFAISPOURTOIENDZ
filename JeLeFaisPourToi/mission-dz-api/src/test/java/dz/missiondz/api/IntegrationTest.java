package dz.missiondz.api;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Test d'intégration Spring Boot, avec le profil {@code test} (H2 en mémoire, voir
 * application-test.yml) activé explicitement — jamais en comptant sur le classpath. Une
 * exécution réelle de l'application (hors tests) ne porte jamais {@code @ActiveProfiles}, donc
 * ne peut jamais basculer sur H2 par accident, quel que soit l'outillage utilisé pour la lancer.
 */
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@SpringBootTest
@ActiveProfiles("test")
public @interface IntegrationTest {
}
