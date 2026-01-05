export const calculateFare = (
  pickupLat: number,
  pickupLng: number,
  dropLat: number,
  dropLng: number,
  activeDrivers: number,
  activeRequests: number
): { price: number; distanceKm: number; surgeMultiplier: number } => {
  // 1. Calculate Distance (Haversine Formula)
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(dropLat - pickupLat);
  const dLon = deg2rad(dropLng - pickupLng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(pickupLat)) *
      Math.cos(deg2rad(dropLat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = R * c;

  // 2. Base Rate (0.5 - 0.7 Euro / km)
  // Let's use 0.6 as a standard base, or randomize slightly for "traffic" simulation if no real data
  const baseRatePerKm = 0.6;
  const platformFee = 0.99;

  // 3. Surge Pricing (Demand > Supply)
  let surgeMultiplier = 1.0;
  
  // Rush Hour Logic (Mock: 7-9 AM and 5-7 PM)
  const now = new Date();
  const hour = now.getHours();
  const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19);
  
  if (isRushHour) {
    surgeMultiplier += 0.2; // +20% for rush hour
  }

  // Demand/Supply Logic
  if (activeRequests > activeDrivers && activeDrivers > 0) {
    const ratio = activeRequests / activeDrivers;
    if (ratio > 1.5) surgeMultiplier += 0.3; // High demand
    else if (ratio > 1.2) surgeMultiplier += 0.1; // Moderate demand
  } else if (activeDrivers === 0 && activeRequests > 0) {
     surgeMultiplier += 0.5; // Very high demand (no drivers)
  }

  // Weather/Traffic Mock (Random factor for "current conditions")
  // In a real app, fetch this from an API
  const trafficFactor = Math.random() * 0.2; // 0 to 20% extra
  surgeMultiplier += trafficFactor;

  // 4. Final Calculation
  let price = (distanceKm * baseRatePerKm * surgeMultiplier) + platformFee;
  
  // Minimum fare
  if (price < 5.00) price = 5.00;

  return {
    price: parseFloat(price.toFixed(2)),
    distanceKm: parseFloat(distanceKm.toFixed(2)),
    surgeMultiplier: parseFloat(surgeMultiplier.toFixed(2))
  };
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
