const VESSEL_TYPES = { SAILBOAT: 'velero', YACHT: 'yate', CATAMARAN: 'catamaran' }

export function mapVessel(vessel) {
  const type = vessel?.type ?? vessel?.navigation_type ?? ''
  return {
    id: vessel?.vessel_id ?? '',
    name: vessel?.name ?? '',
    imageUrl: vessel?.image_url?.trim() || vessel?.photo_url?.trim() || '',
    timezone: vessel?.port?.timezone || 'America/Bogota',
    type: VESSEL_TYPES[type] ?? type,
    location: vessel?.port?.name ?? '',
    shortLocation: vessel?.port?.name ?? '',
    passengers: vessel?.max_capacity ?? 0,
    captain: vessel?.captain_included ?? false,
    cabins: vessel?.cabin_count ?? 0,
    lengthFt: vessel?.length_feet ?? 0,
    lengthM: Number.isFinite(vessel?.length_feet) ? Number((vessel.length_feet * 0.3048).toFixed(1)) : null,
    pricePerDay: vessel?.estimated_total ?? 0,
    amenities: vessel?.amenities ?? [],
    host: { name: vessel?.owner?.validated_name ?? '', badge: '' },
  }
}
