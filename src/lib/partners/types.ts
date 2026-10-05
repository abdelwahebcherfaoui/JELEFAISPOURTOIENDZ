export type PartnerValidationStatus = "EN_ATTENTE" | "VALIDE" | "REFUSE";

export interface Partner {
  partnerId: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  entreprise: string | null;
  specialite: string | null;
  wilaya: string;
  statutValidation: PartnerValidationStatus;
  tauxCommission: number | null;
}

export interface CreatePartnerPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  entreprise?: string;
  specialite?: string;
  wilaya: string;
  tauxCommission?: number;
}
