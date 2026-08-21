package dz.missiondz.api.missions.entity;

import dz.missiondz.api.catalog.entity.ServiceCategory;
import dz.missiondz.api.users.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entité pivot du produit : une demande de service, du dépôt jusqu'à la clôture.
 */
@Entity
@Table(name = "missions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategory category;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "address_algeria", nullable = false)
    private String addressAlgeria;

    @Column(nullable = false)
    private String wilaya;

    @Column(name = "preferred_date")
    private LocalDate preferredDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MissionStatus status;

    /*
     * Exécutant polymorphe : un agent interne (users.entity.User, rôle AGENT) ou un partenaire
     * (users.entity.PartnerProfile). Volontairement pas de @ManyToOne ici — la cible dépend de
     * executorType, et sa résolution se fait au niveau service, pas au niveau persistance.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "executor_type", length = 20)
    private ExecutorType executorType;

    @Column(name = "executor_id")
    private UUID executorId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
