import { apiFetch } from "../api";
import type {
  AddUpdatePayload,
  AssignExecutorPayload,
  CreateMissionPayload,
  DisputePayload,
  Mission,
  MissionUpdate,
  ResolveDisputePayload,
  SendQuotePayload,
} from "./types";

export function createMission(payload: CreateMissionPayload, token: string) {
  return apiFetch<Mission>("/api/missions", { method: "POST", body: payload, token });
}

export function listMissions(token: string) {
  return apiFetch<Mission[]>("/api/missions", { token });
}

export function getMission(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}`, { token });
}

export function listMissionUpdates(id: string, token: string) {
  return apiFetch<MissionUpdate[]>(`/api/missions/${id}/updates`, { token });
}

export function addMissionUpdate(id: string, payload: AddUpdatePayload, token: string) {
  return apiFetch<MissionUpdate>(`/api/missions/${id}/updates`, {
    method: "POST",
    body: payload,
    token,
  });
}

export function sendQuote(id: string, payload: SendQuotePayload, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/quote`, { method: "POST", body: payload, token });
}

export function confirmMission(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/confirm`, { method: "POST", token });
}

export function assignExecutor(id: string, payload: AssignExecutorPayload, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/assign`, { method: "POST", body: payload, token });
}

export function startExecution(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/start`, { method: "POST", token });
}

export function submitProof(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/submit-proof`, { method: "POST", token });
}

export function validateMission(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/validate`, { method: "POST", token });
}

export function disputeMission(id: string, payload: DisputePayload, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/dispute`, { method: "POST", body: payload, token });
}

export function resolveDispute(id: string, payload: ResolveDisputePayload, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/resolve`, { method: "POST", body: payload, token });
}

export function cancelMission(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/cancel`, { method: "POST", token });
}

export function markPaid(id: string, token: string) {
  return apiFetch<Mission>(`/api/missions/${id}/mark-paid`, { method: "POST", token });
}
