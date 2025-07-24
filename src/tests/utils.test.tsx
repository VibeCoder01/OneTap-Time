import { describe, it } from '@/lib/test-runner';
import { dedupeById } from '@/lib/utils';

declare const expect: (actual: any) => any;

export function runUtilsTests() {
  describe('Utility Functions', () => {
    it('dedupeById removes duplicate ids', () => {
      const items = [
        { id: '1', value: 'a' },
        { id: '1', value: 'b' },
        { id: '2', value: 'c' },
      ];
      const result = dedupeById(items);
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });
  });
}
