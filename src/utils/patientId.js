// Generate a unique 9-digit patient ID
export const generatePatientId = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  const id = (timestamp.slice(-6) + random).slice(0, 9);
  return id.padStart(9, '0');
};

// Validate patient ID format
export const validatePatientId = (id) => {
  return /^\d{9}$/.test(id);
};