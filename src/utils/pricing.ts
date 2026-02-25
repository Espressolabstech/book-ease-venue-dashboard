export const DURATIONS = [
    { label: '30 min', value: 30 },
    { label: '60 min', value: 60 },
    { label: '90 min', value: 90 },
    { label: '120 min', value: 120 },
];

export const WEEKEND_DAYS = ['Saturday', 'Sunday'];

export function generateTimeOptions() {
    const times: string[] = [];
    for (let h = 5; h < 24; h++) {
        times.push(`${String(h).padStart(2, '0')}:00`);
        times.push(`${String(h).padStart(2, '0')}:30`);
    }
    times.push('00:00');
    return times;
}
