export const isWithinOffice = (userLat, userLng, officeLat, officeLng, radius = 0.5) => {
  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Earth radius in km

  const dLat = toRad(userLat - officeLat);
  const dLng = toRad(userLng - officeLng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(officeLat)) *
      Math.cos(toRad(userLat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // convert to KM

  return distance <= radius;
};
