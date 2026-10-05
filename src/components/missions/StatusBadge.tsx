import { MISSION_STATUS_LABELS, MISSION_STATUS_STYLES } from "../../lib/missions/status";
import type { MissionStatus } from "../../lib/missions/types";

export function StatusBadge({ status }: { status: MissionStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${MISSION_STATUS_STYLES[status]}`}
    >
      {MISSION_STATUS_LABELS[status]}
    </span>
  );
}
