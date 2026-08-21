package dz.missiondz.api.missions.entity;

/**
 * Statut d'une mission. Voir la matrice des transitions dans la conception technique (§4) pour
 * le détail des déclencheurs, garde-fous et rôles autorisés à chaque transition.
 */
public enum MissionStatus {
    NOUVELLE_DEMANDE,
    DEVIS_ENVOYE,
    CONFIRMEE,
    AFFECTEE,
    EN_EXECUTION,
    PREUVES_DEPOSEES,
    VALIDEE,
    CONTESTEE,
    PAYEE,
    CLOTUREE,
    ANNULEE
}
