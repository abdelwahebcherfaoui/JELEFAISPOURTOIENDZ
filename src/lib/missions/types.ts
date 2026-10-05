export type MissionStatus =
  | "NOUVELLE_DEMANDE"
  | "DEVIS_ENVOYE"
  | "CONFIRMEE"
  | "AFFECTEE"
  | "EN_EXECUTION"
  | "PREUVES_DEPOSEES"
  | "VALIDEE"
  | "CONTESTEE"
  | "PAYEE"
  | "CLOTUREE"
  | "ANNULEE";

export type ExecutorType = "AGENT" | "PARTNER";

export interface Mission {
  id: string;
  clientId: string;
  clientName: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  addressAlgeria: string;
  wilaya: string;
  preferredDate: string | null;
  status: MissionStatus;
  executorType: ExecutorType | null;
  executorId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MissionUpdate {
  id: string;
  authorId: string;
  authorName: string;
  message: string;
  visibleToClient: boolean;
  createdAt: string;
}

export interface CreateMissionPayload {
  categoryId: string;
  title: string;
  description: string;
  addressAlgeria: string;
  wilaya: string;
  preferredDate?: string;
}

export interface SendQuotePayload {
  montant: number;
  devise?: string;
  description?: string;
}

export interface AssignExecutorPayload {
  executorType: ExecutorType;
  executorId: string;
}

export interface AddUpdatePayload {
  message: string;
  visibleToClient: boolean;
}

export interface DisputePayload {
  reason: string;
}

export type DisputeResolution = "REPRISE" | "ANNULATION";

export interface ResolveDisputePayload {
  resolution: DisputeResolution;
}
