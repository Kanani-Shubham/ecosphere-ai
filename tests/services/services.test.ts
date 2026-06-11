import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CarbonCalculationService } from '@/src/services/CarbonCalculationService';
import { NotificationService } from '@/src/services/NotificationService';
import { db } from '@/src/lib/db';
import { useStore } from '@/src/lib/store';

describe('Global Services Test Suite', () => {
  beforeEach(async () => {
    // Clear databases or variables
    await db.notifications.clear();
    useStore.setState({ notifications: [] });
  });

  describe('CarbonCalculationService', () => {
    it('returns valid default emission factor structure', () => {
      const factors = CarbonCalculationService.getEmissionFactors();
      expect(factors.transport.car).toBe(0.18);
      expect(factors.food.redMeat).toBe(7.2);
    });

    it('allows updating factors dynamically', () => {
      CarbonCalculationService.updateEmissionFactors({
        transport: {
          walk: 0,
          bicycle: 0,
          bike: 0.1,
          ev: 0.05,
          car: 0.25, // custom petrol factor
          bus: 0.08,
          train: 0.04,
          flight: 0.18
        }
      });
      const factors = CarbonCalculationService.getEmissionFactors();
      expect(factors.transport.car).toBe(0.25);

      // Revert changes to keep other tests standard
      CarbonCalculationService.updateEmissionFactors({
        transport: {
          walk: 0,
          bicycle: 0,
          bike: 0.09,
          ev: 0.02,
          car: 0.18,
          bus: 0.05,
          train: 0.03,
          flight: 0.15
        }
      });
    });

    it('performs exact math for category queries in compliance with factors', () => {
      expect(CarbonCalculationService.calculateTransport('car', 10)).toBe(1.8);
      expect(CarbonCalculationService.calculateFood('vegan', 2)).toBe(3.0);
      expect(CarbonCalculationService.calculateEnergy('electricity', 100)).toBe(45.0);
      expect(CarbonCalculationService.calculateEnergy('solar', 100)).toBe(2.0);
      expect(CarbonCalculationService.calculateShopping('electronics', 2)).toBe(37.0);
      expect(CarbonCalculationService.calculateWaste('plasticKg', 10)).toBe(14.0);
      expect(CarbonCalculationService.calculateTravel('domesticKm', 100)).toBe(13.0);
      expect(CarbonCalculationService.calculateAppliance('acHourlyKwh', 5)).toBe(2.7); // 5 hrs * 1.2kwh * 0.45 = 2.7
    });

    it('generates proportional breakdown ratios and actionable tailored suggestions', () => {
      const totalsObj = {
        transport: 120,
        food: 80,
        energy: 200,
        shopping: 40,
        waste: 60
      };
      
      const res = CarbonCalculationService.getCarbonBreakdown(totalsObj);
      expect(res.breakdownPercentages).toBeDefined();
      expect(res.breakdownPercentages.energy).toBe(40); // 200 / 500 = 40%
      expect(res.recommendations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('NotificationService', () => {
    it('creates, reads, toggles, and deletes database notifications correctly', async () => {
      // Create new notification
      const item = await NotificationService.createNotification(
        'Testing Alert',
        'Testing system messages alerts',
        'system',
        'system'
      );

      expect(item.id).toBeDefined();
      expect(item.title).toBe('Testing Alert');
      expect(item.read).toBe(false);

      // Check it was cached in store list
      const storeList = useStore.getState().notifications;
      expect(storeList.length).toBe(1);
      expect(storeList[0].id).toBe(item.id);

      // Toggle read state
      await NotificationService.markRead(item.id);
      expect(useStore.getState().notifications[0].read).toBe(true);

      // Toggle unread state
      await NotificationService.markUnread(item.id);
      expect(useStore.getState().notifications[0].read).toBe(false);

      // Delete item
      await NotificationService.deleteNotification(item.id);
      expect(useStore.getState().notifications.length).toBe(0);
    });

    it('exposes custom specific trigger helpers', async () => {
      await NotificationService.notifyChallengeCompleted('Save Plastic Bottles', 50, 100);
      await NotificationService.notifyStreakIncreased(5);
      await NotificationService.notifyCarbonScoreImproved(12);

      const items = useStore.getState().notifications;
      expect(items.length).toBe(3);
    });
  });
});
