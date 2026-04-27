export function cx(...values) {
    return values.filter(Boolean).join(' ');
}
export function toTelHref(phone) {
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
}
