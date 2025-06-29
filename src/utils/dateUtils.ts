export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
}
