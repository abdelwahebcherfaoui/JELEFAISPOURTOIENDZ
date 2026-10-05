package dz.missiondz.api.missions.controller;

import dz.missiondz.api.missions.dto.AddUpdateRequest;
import dz.missiondz.api.missions.dto.AssignExecutorRequest;
import dz.missiondz.api.missions.dto.CreateMissionRequest;
import dz.missiondz.api.missions.dto.DisputeRequest;
import dz.missiondz.api.missions.dto.MissionResponse;
import dz.missiondz.api.missions.dto.MissionUpdateResponse;
import dz.missiondz.api.missions.dto.ResolveDisputeRequest;
import dz.missiondz.api.missions.dto.SendQuoteRequest;
import dz.missiondz.api.missions.service.MissionService;
import dz.missiondz.api.security.CurrentUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints du cycle de vie d'une mission — un par transition de la matrice (conception technique §4). */
@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<MissionResponse> createMission(@Valid @RequestBody CreateMissionRequest request) {
        MissionResponse response = missionService.createMission(CurrentUser.id(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public List<MissionResponse> listMissions() {
        return missionService.listMissions(CurrentUser.id(), CurrentUser.role());
    }

    @GetMapping("/{id}")
    public MissionResponse getMission(@PathVariable UUID id) {
        return missionService.getMission(id, CurrentUser.id(), CurrentUser.role());
    }

    @GetMapping("/{id}/updates")
    public List<MissionUpdateResponse> listUpdates(@PathVariable UUID id) {
        return missionService.listUpdates(id, CurrentUser.id(), CurrentUser.role());
    }

    @PostMapping("/{id}/updates")
    @PreAuthorize("hasAnyRole('ADMIN', 'AGENT', 'PARTNER')")
    public MissionUpdateResponse addUpdate(@PathVariable UUID id, @Valid @RequestBody AddUpdateRequest request) {
        return missionService.addUpdate(id, CurrentUser.id(), request);
    }

    @PostMapping("/{id}/quote")
    @PreAuthorize("hasRole('ADMIN')")
    public MissionResponse sendQuote(@PathVariable UUID id, @Valid @RequestBody SendQuoteRequest request) {
        return missionService.sendQuote(id, request);
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasRole('CLIENT')")
    public MissionResponse confirmMission(@PathVariable UUID id) {
        return missionService.confirmMission(id, CurrentUser.id());
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public MissionResponse assignExecutor(@PathVariable UUID id, @Valid @RequestBody AssignExecutorRequest request) {
        return missionService.assignExecutor(id, request);
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasAnyRole('AGENT', 'PARTNER')")
    public MissionResponse startExecution(@PathVariable UUID id) {
        return missionService.startExecution(id, CurrentUser.id());
    }

    @PostMapping("/{id}/submit-proof")
    @PreAuthorize("hasAnyRole('AGENT', 'PARTNER')")
    public MissionResponse submitProof(@PathVariable UUID id) {
        return missionService.submitProof(id, CurrentUser.id());
    }

    @PostMapping("/{id}/validate")
    @PreAuthorize("hasRole('CLIENT')")
    public MissionResponse validateMission(@PathVariable UUID id) {
        return missionService.validateMission(id, CurrentUser.id());
    }

    @PostMapping("/{id}/dispute")
    @PreAuthorize("hasRole('CLIENT')")
    public MissionResponse disputeMission(@PathVariable UUID id, @Valid @RequestBody DisputeRequest request) {
        return missionService.disputeMission(id, CurrentUser.id(), request);
    }

    @PostMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public MissionResponse resolveDispute(@PathVariable UUID id, @Valid @RequestBody ResolveDisputeRequest request) {
        return missionService.resolveDispute(id, request);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN')")
    public MissionResponse cancelMission(@PathVariable UUID id) {
        return missionService.cancelMission(id, CurrentUser.id(), CurrentUser.role());
    }

    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public MissionResponse markPaid(@PathVariable UUID id) {
        return missionService.markPaid(id);
    }
}
