export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

export function createWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizePhone(phone);

  if (normalizedPhone.length < 10) {
    return null;
  }

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
