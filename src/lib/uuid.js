// Identificadores del contrato de M3 (owner_id, boat_id, reservation_id): UUID.
// Se acepta mayúscula/minúscula y con espacios alrededor, pero no basura (400 VALIDATION_ERROR).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUUID = (value) => UUID_RE.test(String(value ?? '').trim())
