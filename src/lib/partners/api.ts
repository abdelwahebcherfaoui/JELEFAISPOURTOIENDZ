import { apiFetch } from "../api";
import type { CreatePartnerPayload, Partner } from "./types";

export function listPartners(token: string) {
  return apiFetch<Partner[]>("/api/admin/partners", { token });
}

export function createPartner(payload: CreatePartnerPayload, token: string) {
  return apiFetch<Partner>("/api/admin/partners", { method: "POST", body: payload, token });
}

export function validatePartner(id: string, token: string) {
  return apiFetch<Partner>(`/api/admin/partners/${id}/validate`, { method: "POST", token });
}
