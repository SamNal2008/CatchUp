import expect from "expect";
import {getRandomBetween} from "@/repositories/contacts/ReminderFrequency";

describe('Random', () => {
    it('should return random hours between 8 and 10', () => {
        const randomHour = getRandomBetween([{min: 8, max: 10}]);
        expect(randomHour).toBeGreaterThanOrEqual(8);
        expect(randomHour).toBeLessThanOrEqual(10);
    });

    it('should return random hours between 2 intervals', () => {
       const randomHour = getRandomBetween([{min: 8, max: 10}, {min: 12, max: 14}]);
       const isBetween = randomHour >= 8 && randomHour <= 10 || randomHour >= 12 && randomHour <= 14;
       expect(isBetween).toBeTruthy();
    });
});