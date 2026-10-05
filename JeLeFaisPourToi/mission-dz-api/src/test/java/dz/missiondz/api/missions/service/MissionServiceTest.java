package dz.missiondz.api.missions.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import dz.missiondz.api.IntegrationTest;
import dz.missiondz.api.catalog.dao.ServiceCategoryRepository;
import dz.missiondz.api.catalog.entity.CategoryPhase;
import dz.missiondz.api.catalog.entity.ServiceCategory;
import dz.missiondz.api.missions.dao.AttachmentRepository;
import dz.missiondz.api.missions.dao.MissionRepository;
import dz.missiondz.api.missions.dto.AssignExecutorRequest;
import dz.missiondz.api.missions.dto.CreateMissionRequest;
import dz.missiondz.api.missions.dto.DisputeRequest;
import dz.missiondz.api.missions.dto.MissionResponse;
import dz.missiondz.api.missions.dto.ResolveDisputeRequest;
import dz.missiondz.api.missions.dto.SendQuoteRequest;
import dz.missiondz.api.missions.entity.Attachment;
import dz.missiondz.api.missions.entity.AttachmentType;
import dz.missiondz.api.missions.entity.ExecutorType;
import dz.missiondz.api.missions.entity.MissionStatus;
import dz.missiondz.api.payments.dao.PaymentRepository;
import dz.missiondz.api.users.dao.PartnerProfileRepository;
import dz.missiondz.api.users.dao.UserRepository;
import dz.missiondz.api.users.entity.PartnerProfile;
import dz.missiondz.api.users.entity.PartnerValidationStatus;
import dz.missiondz.api.users.entity.Role;
import dz.missiondz.api.users.entity.User;
import java.math.BigDecimal;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

@IntegrationTest
@Transactional
class MissionServiceTest {

    @Autowired
    private MissionService missionService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PartnerProfileRepository partnerProfileRepository;

    @Autowired
    private ServiceCategoryRepository serviceCategoryRepository;

    @Autowired
    private AttachmentRepository attachmentRepository;

    @Autowired
    private MissionRepository missionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    void runsTheFullLifecycleFromCreationToClosureWithAnAgent() {
        User client = createUser(Role.CLIENT);
        User agent = createUser(Role.AGENT);
        ServiceCategory category = createActiveCategory();

        MissionResponse mission = missionService.createMission(client.getId(), createMissionRequest(category.getId()));
        assertThat(mission.status()).isEqualTo(MissionStatus.NOUVELLE_DEMANDE);

        mission = missionService.sendQuote(mission.id(), new SendQuoteRequest(new BigDecimal("80.00"), "EUR", "Inspection standard"));
        assertThat(mission.status()).isEqualTo(MissionStatus.DEVIS_ENVOYE);

        mission = missionService.confirmMission(mission.id(), client.getId());
        assertThat(mission.status()).isEqualTo(MissionStatus.CONFIRMEE);

        mission = missionService.assignExecutor(mission.id(), new AssignExecutorRequest(ExecutorType.AGENT, agent.getId()));
        assertThat(mission.status()).isEqualTo(MissionStatus.AFFECTEE);
        assertThat(mission.executorId()).isEqualTo(agent.getId());

        mission = missionService.startExecution(mission.id(), agent.getId());
        assertThat(mission.status()).isEqualTo(MissionStatus.EN_EXECUTION);

        attachmentRepository.save(Attachment.builder()
                .mission(missionRepository.getReferenceById(mission.id()))
                .cloudinaryUrl("https://cloudinary.example/photo.jpg")
                .cloudinaryPublicId("photo-1")
                .type(AttachmentType.PHOTO)
                .uploadedBy(agent)
                .build());

        mission = missionService.submitProof(mission.id(), agent.getId());
        assertThat(mission.status()).isEqualTo(MissionStatus.PREUVES_DEPOSEES);

        mission = missionService.validateMission(mission.id(), client.getId());
        assertThat(mission.status()).isEqualTo(MissionStatus.VALIDEE);

        mission = missionService.markPaid(mission.id());
        assertThat(mission.status()).isEqualTo(MissionStatus.CLOTUREE);
        assertThat(paymentRepository.findByMissionId(mission.id())).hasSize(1);
    }

    @Test
    void cannotSendAQuoteOutsideNouvelleDemande() {
        User client = createUser(Role.CLIENT);
        ServiceCategory category = createActiveCategory();
        MissionResponse mission = missionService.createMission(client.getId(), createMissionRequest(category.getId()));
        missionService.sendQuote(mission.id(), new SendQuoteRequest(new BigDecimal("80.00"), "EUR", null));

        assertThatThrownBy(() ->
                        missionService.sendQuote(mission.id(), new SendQuoteRequest(new BigDecimal("90.00"), "EUR", null)))
                .isInstanceOf(InvalidMissionStateException.class);
    }

    @Test
    void onlyTheOwningClientCanConfirm() {
        User client = createUser(Role.CLIENT);
        User anotherClient = createUser(Role.CLIENT);
        ServiceCategory category = createActiveCategory();
        MissionResponse mission = missionService.createMission(client.getId(), createMissionRequest(category.getId()));
        missionService.sendQuote(mission.id(), new SendQuoteRequest(new BigDecimal("80.00"), "EUR", null));

        assertThatThrownBy(() -> missionService.confirmMission(mission.id(), anotherClient.getId()))
                .isInstanceOf(MissionAccessDeniedException.class);
    }

    @Test
    void cannotAssignAnUnvalidatedPartner() {
        User client = createUser(Role.CLIENT);
        ServiceCategory category = createActiveCategory();
        MissionResponse mission = missionService.createMission(client.getId(), createMissionRequest(category.getId()));
        missionService.sendQuote(mission.id(), new SendQuoteRequest(new BigDecimal("80.00"), "EUR", null));
        missionService.confirmMission(mission.id(), client.getId());

        User partnerUser = createUser(Role.PARTNER);
        PartnerProfile unvalidatedPartner = partnerProfileRepository.save(PartnerProfile.builder()
                .user(partnerUser)
                .wilaya("Oran")
                .statutValidation(PartnerValidationStatus.EN_ATTENTE)
                .build());

        assertThatThrownBy(() -> missionService.assignExecutor(
                        mission.id(), new AssignExecutorRequest(ExecutorType.PARTNER, unvalidatedPartner.getId())))
                .isInstanceOf(InvalidExecutorException.class);
    }

    @Test
    void aDisputeResolvedAsRepriseGoesBackToExecution() {
        User client = createUser(Role.CLIENT);
        User agent = createUser(Role.AGENT);
        ServiceCategory category = createActiveCategory();
        MissionResponse mission = missionService.createMission(client.getId(), createMissionRequest(category.getId()));
        missionService.sendQuote(mission.id(), new SendQuoteRequest(new BigDecimal("80.00"), "EUR", null));
        missionService.confirmMission(mission.id(), client.getId());
        missionService.assignExecutor(mission.id(), new AssignExecutorRequest(ExecutorType.AGENT, agent.getId()));
        missionService.startExecution(mission.id(), agent.getId());
        attachmentRepository.save(Attachment.builder()
                .mission(missionRepository.getReferenceById(mission.id()))
                .cloudinaryUrl("https://cloudinary.example/photo.jpg")
                .cloudinaryPublicId("photo-2")
                .type(AttachmentType.PHOTO)
                .uploadedBy(agent)
                .build());
        missionService.submitProof(mission.id(), agent.getId());

        MissionResponse disputed =
                missionService.disputeMission(mission.id(), client.getId(), new DisputeRequest("Travail incomplet"));
        assertThat(disputed.status()).isEqualTo(MissionStatus.CONTESTEE);

        MissionResponse resumed = missionService.resolveDispute(
                mission.id(), new ResolveDisputeRequest(ResolveDisputeRequest.Resolution.REPRISE));
        assertThat(resumed.status()).isEqualTo(MissionStatus.EN_EXECUTION);
    }

    @Test
    void aClientCanCancelBeforeAssignmentButNotAfter() {
        User client = createUser(Role.CLIENT);
        User agent = createUser(Role.AGENT);
        ServiceCategory category = createActiveCategory();
        MissionResponse mission = missionService.createMission(client.getId(), createMissionRequest(category.getId()));

        MissionResponse cancelled = missionService.cancelMission(mission.id(), client.getId(), "CLIENT");
        assertThat(cancelled.status()).isEqualTo(MissionStatus.ANNULEE);

        MissionResponse another = missionService.createMission(client.getId(), createMissionRequest(category.getId()));
        missionService.sendQuote(another.id(), new SendQuoteRequest(new BigDecimal("80.00"), "EUR", null));
        missionService.confirmMission(another.id(), client.getId());
        missionService.assignExecutor(another.id(), new AssignExecutorRequest(ExecutorType.AGENT, agent.getId()));

        assertThatThrownBy(() -> missionService.cancelMission(another.id(), client.getId(), "CLIENT"))
                .isInstanceOf(MissionAccessDeniedException.class);

        MissionResponse adminCancelled = missionService.cancelMission(another.id(), UUID.randomUUID(), "ADMIN");
        assertThat(adminCancelled.status()).isEqualTo(MissionStatus.ANNULEE);
    }

    private User createUser(Role role) {
        return userRepository.save(User.builder()
                .email(role.name().toLowerCase() + "." + System.nanoTime() + "@example.com")
                .passwordHash("hash")
                .name(role.name() + " Test")
                .role(role)
                .build());
    }

    private ServiceCategory createActiveCategory() {
        return serviceCategoryRepository.save(ServiceCategory.builder()
                .slug("categorie-" + System.nanoTime())
                .name("Catégorie de test")
                .description("Une catégorie active pour les tests.")
                .icon("🔍")
                .phase(CategoryPhase.MVP)
                .active(true)
                .build());
    }

    private CreateMissionRequest createMissionRequest(UUID categoryId) {
        return new CreateMissionRequest(
                categoryId,
                "Vérifier l'appartement",
                "Vérifier l'état général de l'appartement avant la mise en location.",
                "12 rue des Frères, Alger",
                "Alger",
                null);
    }
}
