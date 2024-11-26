import { calculateAfterFeesLiving, filterData, sortData } from '../screens/HomeScreen';


describe('CS Stipend Rankings App', () => {
  it('should calculate After Fees & Living correctly', () => {
    const stipend = 50000;
    const fees = 5000;
    const livingCost = 20000;

    const result = calculateAfterFeesLiving(stipend, fees, livingCost);
    expect(result).toBe(25000); // 50000 - 5000 - 20000
  });

  it('should filter data by institution type', () => {
    const data = [
      { institution: 'University A', institutionType: 'public' },
      { institution: 'University B', institutionType: 'private' },
    ];
    const filters = { institutionType: 'public' };

    const result = filterData(data, filters);
    expect(result).toEqual([{ institution: 'University A', institutionType: 'public' }]);
  });

  it('should sort data by stipend', () => {
    const data = [
      { institution: 'University A', stipend: 40000 },
      { institution: 'University B', stipend: 45000 },
    ];
    const filters = { sortBy: 'stipend' };

    const result = sortData(data, filters);
    expect(result[0].institution).toBe('University B'); // Higher stipend first
  });
});
