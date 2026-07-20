/** Minimal store mirroring iSensorApp `insightsChipGridStore` for tab bar sync. */
type Listener = () => void;

let expanded = false;
const listeners = new Set<Listener>();

export const insightsChipGridStore = {
  getExpanded: () => expanded,
  setExpanded: (next: boolean) => {
    if (expanded === next) return;
    expanded = next;
    listeners.forEach(listener => listener());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
