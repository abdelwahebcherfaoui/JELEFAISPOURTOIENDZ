package dz.missiondz.api.missions.service;

import dz.missiondz.api.missions.dao.MissionRepository;
import dz.missiondz.api.missions.entity.Mission;
import dz.missiondz.api.missions.entity.MissionStatus;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Valide automatiquement les missions restées en {@link MissionStatus#PREUVES_DEPOSEES} plus de
 * 72h sans retour du client (conception technique §4).
 */
@Component
public class MissionValidationScheduler {

    private static final long TACIT_VALIDATION_HOURS = 72;

    private final MissionRepository missionRepository;

    public MissionValidationScheduler(MissionRepository missionRepository) {
        this.missionRepository = missionRepository;
    }

    @Scheduled(fixedDelayString = "PT1H")
    @Transactional
    public void validateStaleProofs() {
        Instant threshold = Instant.now().minus(TACIT_VALIDATION_HOURS, ChronoUnit.HOURS);
        List<Mission> staleMissions =
                missionRepository.findByStatusAndUpdatedAtBefore(MissionStatus.PREUVES_DEPOSEES, threshold);
        staleMissions.forEach(mission -> mission.setStatus(MissionStatus.VALIDEE));
    }
}
