import { ProductionOrder } from '@production-orders/types';

export interface DateRange {
  start: Date;
  end: Date;
}

export function parseDate(dateString: string): Date {
  return new Date(dateString);
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculateDuration(startDate: string, endDate: string): number {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function setEndDate(startDate: Date, durationDays: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays - 1);
  return endDate;
}

export function rangesOverlap(a: DateRange, b: DateRange): boolean {
  return a.start <= b.end && b.start <= a.end;
}

export function findOverlappingGroups(orders: ProductionOrder[]): ProductionOrder[][] {
  if (orders.length < 2) return [];

  const groups: ProductionOrder[][] = [];
  const assigned = new Set<string>();

  const sortedOrders = [...orders].sort(
    (a, b) => parseDate(a.createdAt).getTime() - parseDate(b.createdAt).getTime()
  );

  for (let i = 0; i < sortedOrders.length; i++) {
    if (assigned.has(sortedOrders[i].id)) continue;

    const group: ProductionOrder[] = [sortedOrders[i]];
    assigned.add(sortedOrders[i].id);

    for (let j = i + 1; j < sortedOrders.length; j++) {
      if (assigned.has(sortedOrders[j].id)) continue;

      const orderRange: DateRange = {
        start: parseDate(sortedOrders[j].startDate),
        end: parseDate(sortedOrders[j].endDate),
      };

      let overlapsWithGroup = false;
      for (const member of group) {
        const memberRange: DateRange = {
          start: parseDate(member.startDate),
          end: parseDate(member.endDate),
        };
        if (rangesOverlap(memberRange, orderRange)) {
          overlapsWithGroup = true;
          break;
        }
      }

      if (overlapsWithGroup) {
        group.push(sortedOrders[j]);
        assigned.add(sortedOrders[j].id);
      }
    }

    if (group.length > 1) {
      groups.push(group);
    }
  }

  return groups;
}

export function rescheduleOverlapGroup(group: ProductionOrder[]): ProductionOrder[] {
  if (group.length < 2) return group;

  const sorted = [...group].sort(
    (a, b) => parseDate(a.createdAt).getTime() - parseDate(b.createdAt).getTime()
  );

  const results: ProductionOrder[] = [];
  let currentDate = parseDate(sorted[0].startDate);

  for (const order of sorted) {
    const duration = calculateDuration(order.startDate, order.endDate);
    const newEndDate = setEndDate(currentDate, duration);

    results.push({
      ...order,
      startDate: toISODateString(currentDate),
      endDate: toISODateString(newEndDate),
    });

    currentDate = new Date(newEndDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return results;
}

export function rescheduleOrders(orders: ProductionOrder[]): { rescheduled: number; orders: ProductionOrder[] } {
  const plannedOrders = orders.filter(o => o.status === 'planned');
  const otherOrders = orders.filter(o => o.status !== 'planned');

  const overlappingGroups = findOverlappingGroups(plannedOrders);

  const result: ProductionOrder[] = [...otherOrders];
  const rescheduledOrders: ProductionOrder[] = [];
  let rescheduledCount = 0;

  for (const group of overlappingGroups) {
    const rescheduled = rescheduleOverlapGroup(group);
    rescheduledOrders.push(...rescheduled);
    rescheduledCount += group.length;
  }

  const overlappingIds = new Set(overlappingGroups.flatMap(g => g.map(o => o.id)));
  const nonOverlappingPlanned = plannedOrders.filter(o => !overlappingIds.has(o.id));

  result.push(...rescheduledOrders, ...nonOverlappingPlanned);

  return {
    rescheduled: rescheduledCount,
    orders: result.sort(
      (a, b) => parseDate(a.createdAt).getTime() - parseDate(b.createdAt).getTime()
    ),
  };
}
