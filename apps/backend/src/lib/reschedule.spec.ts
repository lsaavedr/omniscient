import {
  rangesOverlap,
  findOverlappingGroups,
  rescheduleOverlapGroup,
  rescheduleOrders,
  calculateDuration,
  setEndDate,
  toISODateString,
} from './reschedule';
import { ProductionOrder } from '@production-orders/types';

describe('Reschedule Utilities', () => {
  describe('calculateDuration', () => {
    it('should calculate duration for same day', () => {
      expect(calculateDuration('2024-01-01', '2024-01-01')).toBe(1);
    });

    it('should calculate duration for multiple days', () => {
      expect(calculateDuration('2024-01-01', '2024-01-05')).toBe(5);
    });

    it('should handle date order independence', () => {
      expect(calculateDuration('2024-01-05', '2024-01-01')).toBe(5);
    });
  });

  describe('setEndDate', () => {
    it('should set end date based on duration', () => {
      const start = new Date('2024-01-01');
      const end = setEndDate(start, 5);
      expect(toISODateString(end)).toBe('2024-01-05');
    });

    it('should handle single day duration', () => {
      const start = new Date('2024-01-01');
      const end = setEndDate(start, 1);
      expect(toISODateString(end)).toBe('2024-01-01');
    });
  });

  describe('rangesOverlap', () => {
    it('should detect overlapping ranges', () => {
      const a = { start: new Date('2024-01-01'), end: new Date('2024-01-05') };
      const b = { start: new Date('2024-01-03'), end: new Date('2024-01-07') };
      expect(rangesOverlap(a, b)).toBe(true);
    });

    it('should detect adjacent ranges as overlapping', () => {
      const a = { start: new Date('2024-01-01'), end: new Date('2024-01-05') };
      const b = { start: new Date('2024-01-05'), end: new Date('2024-01-10') };
      expect(rangesOverlap(a, b)).toBe(true);
    });

    it('should not detect non-overlapping ranges', () => {
      const a = { start: new Date('2024-01-01'), end: new Date('2024-01-05') };
      const b = { start: new Date('2024-01-06'), end: new Date('2024-01-10') };
      expect(rangesOverlap(a, b)).toBe(false);
    });
  });

  describe('findOverlappingGroups', () => {
    it('should return empty for no orders', () => {
      expect(findOverlappingGroups([])).toEqual([]);
    });

    it('should return empty for single order', () => {
      const orders: ProductionOrder[] = [{
        id: '1',
        reference: 'REF-001',
        product: 'Product A',
        quantity: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        status: 'planned',
        createdAt: '2024-01-01T00:00:00Z',
      }];
      expect(findOverlappingGroups(orders)).toEqual([]);
    });

    it('should find single overlapping group', () => {
      const orders: ProductionOrder[] = [
        {
          id: '1',
          reference: 'REF-001',
          product: 'Product A',
          quantity: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          status: 'planned',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          reference: 'REF-002',
          product: 'Product B',
          quantity: 20,
          startDate: '2024-01-03',
          endDate: '2024-01-07',
          status: 'planned',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];
      const groups = findOverlappingGroups(orders);
      expect(groups).toHaveLength(1);
      expect(groups[0]).toHaveLength(2);
      expect(groups[0].map(o => o.id)).toContain('1');
      expect(groups[0].map(o => o.id)).toContain('2');
    });

    it('should separate non-overlapping orders', () => {
      const orders: ProductionOrder[] = [
        {
          id: '1',
          reference: 'REF-001',
          product: 'Product A',
          quantity: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          status: 'planned',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          reference: 'REF-002',
          product: 'Product B',
          quantity: 20,
          startDate: '2024-01-10',
          endDate: '2024-01-15',
          status: 'planned',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];
      expect(findOverlappingGroups(orders)).toEqual([]);
    });
  });

  describe('rescheduleOverlapGroup', () => {
    it('should return single order unchanged', () => {
      const orders: ProductionOrder[] = [{
        id: '1',
        reference: 'REF-001',
        product: 'Product A',
        quantity: 10,
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        status: 'planned',
        createdAt: '2024-01-01T00:00:00Z',
      }];
      expect(rescheduleOverlapGroup(orders)).toEqual(orders);
    });

    it('should reschedule in sequential order by createdAt', () => {
      const orders: ProductionOrder[] = [
        {
          id: '1',
          reference: 'REF-001',
          product: 'Product A',
          quantity: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          status: 'planned',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          reference: 'REF-002',
          product: 'Product B',
          quantity: 20,
          startDate: '2024-01-03',
          endDate: '2024-01-05',
          status: 'planned',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];
      const result = rescheduleOverlapGroup(orders);
      expect(result[0].startDate).toBe('2024-01-01');
      expect(result[0].endDate).toBe('2024-01-05');
      expect(result[1].startDate).toBe('2024-01-06');
      expect(result[1].endDate).toBe('2024-01-08');
    });
  });

  describe('rescheduleOrders', () => {
    it('should not reschedule non-planned orders', () => {
      const orders: ProductionOrder[] = [
        {
          id: '1',
          reference: 'REF-001',
          product: 'Product A',
          quantity: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          status: 'completed',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          reference: 'REF-002',
          product: 'Product B',
          quantity: 20,
          startDate: '2024-01-03',
          endDate: '2024-01-05',
          status: 'completed',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];
      const result = rescheduleOrders(orders);
      expect(result.orders).toHaveLength(2);
      expect(result.rescheduled).toBe(0);
    });

    it('should reschedule only planning conflicts and return correct count', () => {
      const orders: ProductionOrder[] = [
        {
          id: '1',
          reference: 'REF-001',
          product: 'Product A',
          quantity: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-05',
          status: 'planned',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          reference: 'REF-002',
          product: 'Product B',
          quantity: 20,
          startDate: '2024-01-03',
          endDate: '2024-01-05',
          status: 'planned',
          createdAt: '2024-01-02T00:00:00Z',
        },
      ];
      const result = rescheduleOrders(orders);
      expect(result.rescheduled).toBe(2);
      expect(result.orders.find(o => o.id === '1')?.startDate).toBe('2024-01-01');
      expect(result.orders.find(o => o.id === '1')?.endDate).toBe('2024-01-05');
      expect(result.orders.find(o => o.id === '2')?.startDate).toBe('2024-01-06');
      expect(result.orders.find(o => o.id === '2')?.endDate).toBe('2024-01-08');
    });

    it('should handle complex overlapping group', () => {
      const orders: ProductionOrder[] = [
        {
          id: '1',
          reference: 'REF-001',
          product: 'Product A',
          quantity: 10,
          startDate: '2024-01-01',
          endDate: '2024-01-03',
          status: 'planned',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          reference: 'REF-002',
          product: 'Product B',
          quantity: 20,
          startDate: '2024-01-02',
          endDate: '2024-01-04',
          status: 'planned',
          createdAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          reference: 'REF-003',
          product: 'Product C',
          quantity: 30,
          startDate: '2024-01-06',
          endDate: '2024-01-10',
          status: 'planned',
          createdAt: '2024-01-03T00:00:00Z',
        },
      ];
      const result = rescheduleOrders(orders);
      expect(result.rescheduled).toBe(2);
      expect(result.orders.find(o => o.id === '3')?.startDate).toBe('2024-01-06');
    });
  });
});
