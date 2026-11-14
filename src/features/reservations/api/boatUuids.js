// UUID de cada embarcación del prototipo en el stub de Flota (M1) que M3 consulta para las
// estimaciones (wiremock/mappings/fleet-base-rates.json del backend). Sin mapeo no hay
// estimación real. Temporal hasta que M1 entregue los UUID reales de las embarcaciones.
export const BOAT_UUIDS = {
  'sunset-catamaran': '3f2c1a54-8b3e-4d7a-9c10-5a2b7e6f1d01',
  'ocean-whisper': '9a1b7c33-2e4f-4b58-8d6a-0c9e5f3a2b02',
  'lagoon-46': 'c3d4e5f6-7890-1234-cdef-345678901234',
  'kalua-day-sailer': 'e5f67890-1234-5678-efab-567890123456',
}

export const boatUuid = (id) => BOAT_UUIDS[id] ?? null
