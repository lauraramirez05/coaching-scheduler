export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';

  // Remove any non-digit characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');

  // Check if the cleaned number has a valid length
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }

  return phoneNumber; // Return the original if it doesn't match the expected format
};
