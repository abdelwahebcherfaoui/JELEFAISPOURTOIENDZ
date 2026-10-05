package dz.missiondz.api.missions.service;

import dz.missiondz.api.catalog.dao.ServiceCategoryRepository;
import dz.missiondz.api.catalog.entity.ServiceCategory;
import dz.missiondz.api.catalog.service.CategoryNotFoundException;
import dz.missiondz.api.missions.dao.AttachmentRepository;
import dz.missiondz.api.missions.dao.MissionRepository;
import dz.missiondz.api.missions.dao.MissionUpdateRepository;
import dz.missiondz.api.missions.dto.AddUpdateRequest;
import dz.missiondz.api.missions.dto.AssignExecutorRequest;
import dz.missiondz.api.missions.dto.CreateMissionRequest;
import dz.missiondz.api.missions.dto.DisputeRequest;
import dz.missiondz.api.missions.dto.MissionResponse;
import dz.missiondz.api.missions.dto.MissionUpdateResponse;
import dz.missiondz.api.missions.dto.ResolveDisputeRequest;
import dz.missiondz.api.missions.dto.SendQuoteRequest;
import dz.missiondz.api.missions.entity.Attachment;
import dz.missiondz.api.missions.entity.ExecutorType;
import dz.missiondz.api.missions.entity.Mission;
import dz.missiondz.api.missions.entity.MissionStatus;
import dz.missiondz.api.missions.entity.MissionUpdate;
import dz.missiondz.api.payments.dao.PaymentRepository;
import dz.missiondz.api.payments.dao.QuoteRepository;
import dz.missiondz.api.payments.entity.Payment;
import dz.missiondz.api.payments.entity.PaymentMethod;
import dz.missiondz.api.payments.entity.PaymentStatus;
import dz.missiondz.api.payments.entity.PaymentType;
import dz.missiondz.api.payments.entity.Quote;
import dz.missiondz.api.payments.entity.QuoteStatus;
import dz.missiondz.api.users.dao.PartnerProfileRepository;
import dz.missiondz.api.users.dao.UserRepository;
import dz.missiondz.api.users.entity.PartnerProfile;
import dz.missiondz.api.users.entity.PartnerValidationStatus;
import dz.missiondz.api.users.entity.Role;
import dz.missiondz.api.users.entity.User;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Applique la matrice de transitions de la conception technique (§4) : chaque méthode publique
 * correspond à une ligne de la matrice — vérifie le statut courant et le rôle/l'appartenance
 * avant de faire évoluer la mission.
 *
 * <p>{@code sendQuote} et {@code markPaid} persistent directement un {@code Quote}/{@code
 * Payment} via leurs repositories — le module {@code payments} n'a pas de service/contrôleur
 * dédié pour l'instant, mais ces deux transitions ont besoin d'enregistrer ces données pour que
 * le modèle reste cohérent (une mission {@code PAYEE} sans aucun {@code Payment} serait un trou).
 */
@Service
public class MissionService {

    private final MissionRepository missionRepository;
    private final MissionUpdateRepository missionUpdateRepository;
    private final AttachmentRepository attachmentRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final UserRepository userRepository;
    private final PartnerProfileRepository partnerProfileRepository;
    private final QuoteRepository quoteRepository;
    private final PaymentRepository paymentRepository;

    public MissionService(
            MissionRepository missionRepository,
            MissionUpdateRepository missionUpdateRepository,
            AttachmentRepository attachmentRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            UserRepository userRepository,
            PartnerProfileRepository partnerProfileRepository,
            QuoteRepository quoteRepository,
            PaymentRepository paymentRepository) {
        this.missionRepository = missionRepository;
        this.missionUpdateRepository = missionUpdateRepository;
        this.attachmentRepository = attachmentRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.userRepository = userRepository;
        this.partnerProfileRepository = partnerProfileRepository;
        this.quoteRepository = quoteRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public MissionResponse createMission(UUID clientId, CreateMissionRequest request) {
        User client = userRepository.findById(clientId).orElseThrow();
        ServiceCategory category = serviceCategoryRepository
                .findById(request.categoryId())
                .filter(ServiceCategory::isActive)
                .orElseThrow(() -> new CategoryNotFoundException(request.categoryId()));

        Mission mission = Mission.builder()
                .client(client)
                .category(category)
                .title(request.title())
                .description(request.description())
                .addressAlgeria(request.addressAlgeria())
                .wilaya(request.wilaya())
                .preferredDate(request.preferredDate())
                .status(MissionStatus.NOUVELLE_DEMANDE)
                .build();
        missionRepository.save(mission);

        return toResponse(mission);
    }

    public List<MissionResponse> listMissions(UUID currentUserId, String role) {
        List<Mission> missions =
                switch (role) {
                    case "ADMIN" -> missionRepository.findAll();
                    case "CLIENT" -> missionRepository.findByClientId(currentUserId);
                    case "AGENT" -> missionRepository.findByExecutorId(currentUserId);
                    case "PARTNER" -> partnerProfileRepository
                            .findByUserId(currentUserId)
                            .map(profile -> missionRepository.findByExecutorId(profile.getId()))
                            .orElse(List.of());
                    default -> List.of();
                };
        return missions.stream().map(this::toResponse).toList();
    }

    public MissionResponse getMission(UUID missionId, UUID currentUserId, String role) {
        Mission mission = findMissionOrThrow(missionId);
        checkReadAccess(mission, currentUserId, role);
        return toResponse(mission);
    }

    public List<MissionUpdateResponse> listUpdates(UUID missionId, UUID currentUserId, String role) {
        Mission mission = findMissionOrThrow(missionId);
        checkReadAccess(mission, currentUserId, role);

        List<MissionUpdate> updates = missionUpdateRepository.findByMissionIdOrderByCreatedAtAsc(missionId);
        if ("CLIENT".equals(role)) {
            updates = updates.stream().filter(MissionUpdate::isVisibleToClient).toList();
        }
        return updates.stream().map(this::toUpdateResponse).toList();
    }

    @Transactional
    public MissionUpdateResponse addUpdate(UUID missionId, UUID authorId, AddUpdateRequest request) {
        Mission mission = findMissionOrThrow(missionId);
        User author = userRepository.findById(authorId).orElseThrow();

        MissionUpdate update = MissionUpdate.builder()
                .mission(mission)
                .author(author)
                .message(request.message())
                .visibleToClient(request.visibleToClient())
                .build();
        missionUpdateRepository.save(update);

        return toUpdateResponse(update);
    }

    @Transactional
    public MissionResponse sendQuote(UUID missionId, SendQuoteRequest request) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.NOUVELLE_DEMANDE, "envoyer un devis");

        Quote quote = Quote.builder()
                .mission(mission)
                .montant(request.montant())
                .devise(request.devise() == null || request.devise().isBlank() ? "EUR" : request.devise())
                .description(request.description())
                .statut(QuoteStatus.EN_ATTENTE)
                .build();
        quoteRepository.save(quote);

        mission.setStatus(MissionStatus.DEVIS_ENVOYE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse confirmMission(UUID missionId, UUID clientId) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.DEVIS_ENVOYE, "confirmer");
        requireClientOwnership(mission, clientId);

        // Pas de vérification d'acompte ici — le module payments (Stripe) n'est pas construit.
        // Sans risque tant que seule la catégorie MVP (Vérification/Inspection, sans acompte)
        // est active ; à traiter avant l'ouverture de la Phase 1 (cf. conception fonctionnelle §5).
        mission.setStatus(MissionStatus.CONFIRMEE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse assignExecutor(UUID missionId, AssignExecutorRequest request) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.CONFIRMEE, "affecter un exécutant");

        if (request.executorType() == ExecutorType.AGENT) {
            User agent = userRepository
                    .findById(request.executorId())
                    .orElseThrow(() -> new InvalidExecutorException("Aucun agent trouvé avec cet identifiant."));
            if (agent.getRole() != Role.AGENT) {
                throw new InvalidExecutorException("L'utilisateur désigné n'est pas un agent interne.");
            }
        } else {
            PartnerProfile partner = partnerProfileRepository
                    .findById(request.executorId())
                    .orElseThrow(() -> new InvalidExecutorException("Aucun partenaire trouvé avec cet identifiant."));
            if (partner.getStatutValidation() != PartnerValidationStatus.VALIDE) {
                throw new InvalidExecutorException("Ce partenaire n'est pas encore validé par l'administrateur.");
            }
        }

        mission.setExecutorType(request.executorType());
        mission.setExecutorId(request.executorId());
        mission.setStatus(MissionStatus.AFFECTEE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse startExecution(UUID missionId, UUID currentUserId) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.AFFECTEE, "démarrer l'exécution");
        requireExecutor(mission, currentUserId);

        mission.setStatus(MissionStatus.EN_EXECUTION);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse submitProof(UUID missionId, UUID currentUserId) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.EN_EXECUTION, "déposer les preuves");
        requireExecutor(mission, currentUserId);

        List<Attachment> attachments = attachmentRepository.findByMissionId(missionId);
        if (attachments.isEmpty()) {
            throw new InvalidMissionStateException(
                    mission.getStatus(), "déposer les preuves sans aucune pièce jointe");
        }

        mission.setStatus(MissionStatus.PREUVES_DEPOSEES);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse validateMission(UUID missionId, UUID clientId) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.PREUVES_DEPOSEES, "valider");
        requireClientOwnership(mission, clientId);

        mission.setStatus(MissionStatus.VALIDEE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse disputeMission(UUID missionId, UUID clientId, DisputeRequest request) {
        Mission mission = findMissionOrThrow(missionId);
        if (mission.getStatus() != MissionStatus.PREUVES_DEPOSEES && mission.getStatus() != MissionStatus.VALIDEE) {
            throw new InvalidMissionStateException(mission.getStatus(), "contester");
        }
        requireClientOwnership(mission, clientId);

        MissionUpdate update = MissionUpdate.builder()
                .mission(mission)
                .author(mission.getClient())
                .message("Contestation : " + request.reason())
                .visibleToClient(true)
                .build();
        missionUpdateRepository.save(update);

        mission.setStatus(MissionStatus.CONTESTEE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse resolveDispute(UUID missionId, ResolveDisputeRequest request) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.CONTESTEE, "arbitrer");

        mission.setStatus(
                request.resolution() == ResolveDisputeRequest.Resolution.REPRISE
                        ? MissionStatus.EN_EXECUTION
                        : MissionStatus.ANNULEE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse cancelMission(UUID missionId, UUID currentUserId, String role) {
        Mission mission = findMissionOrThrow(missionId);
        MissionStatus status = mission.getStatus();

        boolean earlyState = status == MissionStatus.NOUVELLE_DEMANDE
                || status == MissionStatus.DEVIS_ENVOYE
                || status == MissionStatus.CONFIRMEE;
        boolean lateState = status == MissionStatus.AFFECTEE || status == MissionStatus.EN_EXECUTION;

        if (earlyState) {
            requireClientOwnership(mission, currentUserId);
        } else if (lateState) {
            if (!"ADMIN".equals(role)) {
                throw new MissionAccessDeniedException();
            }
        } else {
            throw new InvalidMissionStateException(status, "annuler");
        }

        mission.setStatus(MissionStatus.ANNULEE);
        return toResponse(mission);
    }

    @Transactional
    public MissionResponse markPaid(UUID missionId) {
        Mission mission = findMissionOrThrow(missionId);
        requireStatus(mission, MissionStatus.VALIDEE, "marquer comme payée");

        BigDecimal montant = quoteRepository.findByMissionId(missionId).stream()
                .reduce((first, second) -> second)
                .map(Quote::getMontant)
                .orElse(BigDecimal.ZERO);

        Payment payment = Payment.builder()
                .mission(mission)
                .type(PaymentType.SOLDE)
                .montant(montant)
                .statut(PaymentStatus.PAYE)
                .methode(PaymentMethod.MANUEL)
                .build();
        paymentRepository.save(payment);

        // PAYEE est immédiatement suivi de CLOTUREE : conformément à la conception technique,
        // cette dernière transition est déclenchée par le système, pas par une action admin dédiée.
        mission.setStatus(MissionStatus.CLOTUREE);
        return toResponse(mission);
    }

    // --- appartenance & accès ---

    private boolean isExecutor(Mission mission, UUID currentUserId) {
        if (mission.getExecutorType() == ExecutorType.AGENT) {
            return currentUserId.equals(mission.getExecutorId());
        }
        if (mission.getExecutorType() == ExecutorType.PARTNER) {
            return partnerProfileRepository
                    .findByUserId(currentUserId)
                    .map(PartnerProfile::getId)
                    .map(id -> id.equals(mission.getExecutorId()))
                    .orElse(false);
        }
        return false;
    }

    private void checkReadAccess(Mission mission, UUID currentUserId, String role) {
        boolean allowed =
                switch (role) {
                    case "ADMIN" -> true;
                    case "CLIENT" -> mission.getClient().getId().equals(currentUserId);
                    case "AGENT", "PARTNER" -> isExecutor(mission, currentUserId);
                    default -> false;
                };
        if (!allowed) {
            throw new MissionAccessDeniedException();
        }
    }

    private void requireClientOwnership(Mission mission, UUID clientId) {
        if (!mission.getClient().getId().equals(clientId)) {
            throw new MissionAccessDeniedException();
        }
    }

    private void requireExecutor(Mission mission, UUID currentUserId) {
        if (!isExecutor(mission, currentUserId)) {
            throw new MissionAccessDeniedException();
        }
    }

    // --- divers ---

    private Mission findMissionOrThrow(UUID missionId) {
        return missionRepository.findById(missionId).orElseThrow(() -> new MissionNotFoundException(missionId));
    }

    private void requireStatus(Mission mission, MissionStatus expected, String action) {
        if (mission.getStatus() != expected) {
            throw new InvalidMissionStateException(mission.getStatus(), action);
        }
    }

    private MissionResponse toResponse(Mission mission) {
        return new MissionResponse(
                mission.getId(),
                mission.getClient().getId(),
                mission.getClient().getName(),
                mission.getCategory().getId(),
                mission.getCategory().getName(),
                mission.getTitle(),
                mission.getDescription(),
                mission.getAddressAlgeria(),
                mission.getWilaya(),
                mission.getPreferredDate(),
                mission.getStatus(),
                mission.getExecutorType(),
                mission.getExecutorId(),
                mission.getCreatedAt(),
                mission.getUpdatedAt());
    }

    private MissionUpdateResponse toUpdateResponse(MissionUpdate update) {
        return new MissionUpdateResponse(
                update.getId(),
                update.getAuthor().getId(),
                update.getAuthor().getName(),
                update.getMessage(),
                update.isVisibleToClient(),
                update.getCreatedAt());
    }
}
