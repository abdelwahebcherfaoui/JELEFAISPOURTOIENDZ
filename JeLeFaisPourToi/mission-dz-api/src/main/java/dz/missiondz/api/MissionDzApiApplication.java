package dz.missiondz.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MissionDzApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MissionDzApiApplication.class, args);
	}

}
