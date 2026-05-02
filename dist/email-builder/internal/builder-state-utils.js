let __idCounter = 0;
function genId(prefix = 'blk') {
    __idCounter += 1;
    return `${prefix}_${Date.now().toString(36)}_${__idCounter.toString(36)}`;
}
export function addBlock(doc, block, atIndex) {
    const blocks = [...doc.blocks];
    const idx = atIndex ?? blocks.length;
    blocks.splice(idx, 0, block);
    return { ...doc, blocks };
}
export function removeBlock(doc, blockId) {
    return { ...doc, blocks: doc.blocks.filter((b) => b.id !== blockId) };
}
export function moveBlock(doc, fromIndex, toIndex) {
    if (fromIndex === toIndex)
        return doc;
    const blocks = [...doc.blocks];
    const [moved] = blocks.splice(fromIndex, 1);
    if (!moved)
        return doc;
    blocks.splice(toIndex, 0, moved);
    return { ...doc, blocks };
}
export function updateBlockProps(doc, blockId, patch) {
    return {
        ...doc,
        blocks: doc.blocks.map((b) => b.id === blockId
            ? { ...b, props: { ...b.props, ...patch } }
            : b),
    };
}
export function duplicateBlock(doc, blockId) {
    const idx = doc.blocks.findIndex((b) => b.id === blockId);
    if (idx === -1)
        return doc;
    const original = doc.blocks[idx];
    if (!original)
        return doc;
    const clone = {
        ...original,
        id: genId(original.kind),
        props: { ...original.props },
        children: original.children?.map((col) => col.map((b) => ({ ...b, id: genId(b.kind) }))),
    };
    const blocks = [...doc.blocks];
    blocks.splice(idx + 1, 0, clone);
    return { ...doc, blocks };
}
export function findBlock(doc, blockId) {
    return doc.blocks.find((b) => b.id === blockId) ?? null;
}
