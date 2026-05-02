export function isDragData(value) {
    if (!value || typeof value !== 'object')
        return false;
    const v = value;
    return v.kind === 'block' || v.kind === 'palette';
}
