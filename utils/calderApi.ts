interface FreeSlot {
  start: string;
  end: string;
}
export const calculateFreeSlots = (busySlots: Array<any>): Array<FreeSlot> => {
  busySlots.sort((a, b) => (a.start > b.start ? 1 : -1));

  const freeSlots: Array<FreeSlot> = [];
  let previousEndTime = new Date().toISOString();

  for (const busySlot of busySlots) {
    const busyStartTime = new Date(busySlot.start);
    const busyEndTime = new Date(busySlot.end);

    if (busyStartTime > new Date(previousEndTime)) {
      freeSlots.push({
        start: previousEndTime,
        end: busyStartTime.toISOString(),
      });
    }

    previousEndTime = busyEndTime.toISOString();
  }

  return freeSlots;
};
