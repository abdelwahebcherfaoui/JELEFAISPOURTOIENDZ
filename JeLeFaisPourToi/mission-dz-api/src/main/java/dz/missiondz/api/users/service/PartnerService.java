package dz.missiondz.api.users.service;

import dz.missiondz.api.users.dao.PartnerProfileRepository;
import dz.missiondz.api.users.dao.UserRepository;
import dz.missiondz.api.users.dto.CreatePartnerRequest;
import dz.missiondz.api.users.dto.PartnerResponse;
import dz.missiondz.api.users.entity.PartnerProfile;
import dz.missiondz.api.users.entity.PartnerValidationStatus;
import dz.missiondz.api.users.entity.Role;
import dz.missiondz.api.users.entity.User;
import java.util.List;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Onboarding des partenaires professionnels : toujours créés par l'administrateur, jamais par auto-inscription. */
@Service
public class PartnerService {

    private final UserRepository userRepository;
    private final PartnerProfileRepository partnerProfileRepository;
    private final PasswordEncoder passwordEncoder;

    public PartnerService(
            UserRepository userRepository,
            PartnerProfileRepository partnerProfileRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.partnerProfileRepository = partnerProfileRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public PartnerResponse createPartner(CreatePartnerRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new EmailAlreadyUsedException(request.email());
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .phone(request.phone())
                .role(Role.PARTNER)
                .build();
        userRepository.save(user);

        PartnerProfile partnerProfile = PartnerProfile.builder()
                .user(user)
                .entreprise(request.entreprise())
                .specialite(request.specialite())
                .wilaya(request.wilaya())
                .statutValidation(PartnerValidationStatus.EN_ATTENTE)
                .tauxCommission(request.tauxCommission())
                .build();
        partnerProfileRepository.save(partnerProfile);

        return toResponse(partnerProfile);
    }

    public List<PartnerResponse> listPartners() {
        return partnerProfileRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public PartnerResponse validatePartner(UUID partnerId) {
        PartnerProfile partnerProfile = partnerProfileRepository
                .findById(partnerId)
                .orElseThrow(() -> new PartnerNotFoundException(partnerId));
        partnerProfile.setStatutValidation(PartnerValidationStatus.VALIDE);
        return toResponse(partnerProfile);
    }

    private PartnerResponse toResponse(PartnerProfile partnerProfile) {
        User user = partnerProfile.getUser();
        return new PartnerResponse(
                partnerProfile.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                partnerProfile.getEntreprise(),
                partnerProfile.getSpecialite(),
                partnerProfile.getWilaya(),
                partnerProfile.getStatutValidation(),
                partnerProfile.getTauxCommission());
    }
}
