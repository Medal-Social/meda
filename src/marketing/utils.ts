export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
