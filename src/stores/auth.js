import { useAuth } from '@/composables/useAuth';

export function useAuthStore() {
  const auth = useAuth();

  return {
    async checkEmail() {
      return { exists: false };
    },

    async checkDocument() {
      return { exists: false };
    },

    async signup(data) {
      const profileType = String(data.profile_type ?? data.type ?? 'producer').toLowerCase();
      const normalized = {
        profile_type: profileType,
        user: {
          name: (data.user?.name ?? data.name ?? '').trim(),
          email: (data.user?.email ?? data.email ?? '').trim(),
          password: data.user?.password ?? data.password ?? '',
          password_confirmation:
            data.user?.password_confirmation ??
            data.password_confirmation ??
            (data.user?.password ?? data.password ?? ''),
        },
        company: {
          trade_name: (data.company?.trade_name ?? data.profile?.trade_name ?? '').trim(),
          legal_name: (data.company?.legal_name ?? data.company?.trade_name ?? data.profile?.trade_name ?? '').trim(),
          document_number: (data.company?.document_number ?? data.profile?.document_number ?? '').replace(/\D/g, ''),
          phone: (data.company?.phone ?? data.company_phone ?? '').replace(/\D/g, ''),
          address: {
            zip: (data.company?.address?.zip ?? data.address?.postal_code ?? '').replace(/\D/g, ''),
            number: (data.company?.address?.number ?? data.address?.number ?? '').trim(),
            complement: data.company?.address?.complement ?? data.address?.complement ?? null,
            reference_point: data.company?.address?.reference_point ?? data.address?.reference_point ?? null,
          },
        },
        ...(profileType === 'producer'
          ? {
              producer: {
                activity_segment: data.producer?.activity_segment ?? data.activity_segment,
              },
            }
          : {}),
        ...(profileType === 'retailer'
          ? {
              retailer: {
                business_type: data.retailer?.business_type ?? data.business_type,
              },
            }
          : {}),
        ...(profileType === 'delivery'
          ? {
              delivery: {
                cnh_number: String(data.delivery?.cnh_number ?? data.cnh_number ?? '').replace(/\D/g, ''),
                cnh_category: data.delivery?.cnh_category ?? data.cnh_category ?? 'B',
                vehicle: {
                  plate: String(data.delivery?.vehicle?.plate ?? data.vehicle_plate ?? '')
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, ''),
                  cargo_type: data.delivery?.vehicle?.cargo_type ?? data.cargo_type ?? 'dry',
                },
              },
            }
          : {}),
      };

      return auth.signup(normalized);
    },
  };
}
