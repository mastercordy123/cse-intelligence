/**
 * Utility to check CSE Market Hours and Holidays
 * Market Hours: 9:30 AM - 2:30 PM (Monday to Friday)
 * Timezone: Asia/Colombo (UTC+5:30)
 */

export interface MarketStatus {
  isOpen: boolean;
  message: string;
  reason: 'CLOSED' | 'OPEN' | 'WEEKEND' | 'HOLIDAY';
}

// Note: In a production environment, this list should be fetched from an API
// or a persistent database. For this professional prototype, we include the 2024/2025 known major holidays.
const SRI_LANKA_HOLIDAYS = [
  '2024-01-15', // Tamil Thai Pongal
  '2024-01-25', // Duruthu Full Moon Poya
  '2024-02-04', // Independence Day
  '2024-02-23', // Navam Full Moon Poya
  '2024-03-08', // Mahasivarathri
  '2024-03-24', // Medin Full Moon Poya
  '2024-03-29', // Good Friday
  '2024-04-10', // Id-Ul-Fitr
  '2024-04-12', // Sinhala & Tamil New Year
  '2024-04-13', // Sinhala & Tamil New Year
  '2024-04-23', // Bak Full Moon Poya
  '2024-05-01', // May Day
  '2024-05-23', // Vesak Full Moon Poya
  '2024-05-24', // Day after Vesak Full Moon Poya
  '2024-06-21', // Poson Full Moon Poya
  '2024-07-20', // Esala Full Moon Poya
  '2024-08-19', // Nikini Full Moon Poya
  '2024-09-16', // Milad-Un-Nabi
  '2024-09-17', // Binara Full Moon Poya
  '2024-10-17', // Vap Full Moon Poya
  '2024-10-31', // Deepavali
  '2024-11-15', // Il Full Moon Poya
  '2024-12-14', // Unduvap Full Moon Poya
  '2024-12-25', // Christmas
  // 2025 partial
  '2025-01-14',
  '2025-04-13',
  '2025-04-14',
];

export function getMarketStatus(): MarketStatus {
  // Get current time in Sri Lanka (UTC+5:30)
  const now = new Date();
  const colomboTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(now);

  const parts: Record<string, string> = {};
  colomboTime.forEach(p => parts[p.type] = p.value);

  const year = parts.year;
  const month = parts.month;
  const day = parts.day;
  const hour = parseInt(parts.hour || '0');
  const minute = parseInt(parts.minute || '0');
  const dayOfWeek = now.getUTCDay(); // This might be slightly off due to UTC, let's use the local date object for day of week in SL

  // Better way for Day of week in Colombo
  const colomboDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Colombo' }));
  const slDayOfWeek = colomboDate.getDay(); // 0 = Sun, 6 = Sat
  const dateStr = `${year}-${month}-${day}`;

  // 1. Check Weekend
  if (slDayOfWeek === 0 || slDayOfWeek === 6) {
    return { isOpen: false, message: 'Market Closed (Weekend)', reason: 'WEEKEND' };
  }

  // 2. Check Holidays
  if (SRI_LANKA_HOLIDAYS.includes(dateStr)) {
    return { isOpen: false, message: 'Market Closed (Public Holiday)', reason: 'HOLIDAY' };
  }

  // 3. Check Hours (9:30 - 14:30)
  const totalMinutes = hour * 60 + minute;
  const openTime = 9 * 60 + 30; // 570
  const closeTime = 14 * 60 + 30; // 870

  if (totalMinutes < openTime || totalMinutes >= closeTime) {
    return { isOpen: false, message: 'Market Closed (Outside Trading Hours)', reason: 'CLOSED' };
  }

  return { isOpen: true, message: 'Market is Open', reason: 'OPEN' };
}
