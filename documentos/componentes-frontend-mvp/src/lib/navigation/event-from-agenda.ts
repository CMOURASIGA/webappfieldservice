const STORAGE_KEY = "cnc_evt_nav_from_agenda_href";

/**
 * Chamado no clique dos links da agenda → detalhe do evento.
 */
export function markNavigateToEventFromAgenda(href: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, href);
  } catch {
    console.error("Error marking navigate to event from agenda", href);
  }
}

export function clearNavigateToEventFromAgenda() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    console.error("Error clearing navigate to event from agenda");
  }
}

export function readNavigateToEventFromAgenda(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
