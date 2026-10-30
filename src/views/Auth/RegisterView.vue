<template>
  <div class="relative flex min-h-screen items-center justify-center bg-[#F3F1E9] px-6 py-24 lg:py-0">
    <header class="absolute top-8 inset-x-0 mx-auto flex h-11 w-full max-w-[1440px] items-center justify-between px-6 min-[1080px]:px-[7.22%]">
      <RouterLink to="/" class="flex items-center gap-3" aria-label="Cultiva, início">
        <img src="/favicon.png" alt="" class="h-11 w-11 rounded-[10px] object-contain" />
        <span class="font-display text-[27px] font-semibold text-[#287A4E]">Cultiva</span>
      </RouterLink>
      <RouterLink to="/" class="text-sm font-semibold text-[#287A4E] hover:underline">
        Voltar
      </RouterLink>
    </header>

    <div
      class="flex w-full flex-col rounded-[24px] border border-[#DFE3D9] bg-white p-6 sm:p-10"
      :class="currentStep === 2 && form.type === 'delivery' ? 'max-w-[900px] min-h-[720px]' : currentStep === 2 ? 'max-w-[820px] min-h-[520px]' : 'max-w-[820px] min-h-[650px]'"
    >
      <h2 class="mb-3 text-center font-display text-[34px] leading-[42px] font-semibold text-[#287A4E]">Criar Conta</h2>

      <div class="mb-11 flex justify-center">
        <div class="flex gap-2.5">
          <div
            :class="['h-2 w-[110px] rounded-full', currentStep >= 1 ? 'bg-[#287A4E]' : 'bg-[#DFE3D9]']"
          ></div>
          <div
            :class="['h-2 w-[110px] rounded-full', currentStep >= 2 ? 'bg-[#287A4E]' : 'bg-[#DFE3D9]']"
          ></div>
          <div
            :class="['h-2 w-[110px] rounded-full', currentStep >= 3 ? 'bg-[#287A4E]' : 'bg-[#DFE3D9]']"
          ></div>
        </div>
      </div>

      <form class="flex flex-1 flex-col" novalidate @submit.prevent="currentStep < 3 ? nextStep() : handleCadastro()">
        <!-- Step 1: basico -->
        <div v-if="currentStep === 1" class="grid flex-1 content-start grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Nome Completo</label>
            <input
              v-model="form.name"
              maxlength="100"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.name }"
              required
              @input="errors.name && validateName()"
            />
            <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Email</label>
            <input
              v-model="form.email"
              maxlength="100"
              type="email"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.email }"
              required
              @input="validateEmail()"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Eu sou um:</label>
            <select
              v-model="form.type"
              class="h-12 w-full cursor-pointer rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
            >
              <option value="producer">Produtor</option>
              <option value="retailer">Varejista</option>
              <option value="delivery">Entregador</option>
            </select>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]"
              >Nome fantasia / Razão social</label
            >
            <input
              v-model="form.nome_fantasia"
              maxlength="100"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.nome_fantasia }"
              required
              @input="errors.nome_fantasia && validateNomeFantasia()"
            />
            <p v-if="errors.nome_fantasia" class="mt-1 text-sm text-red-600">
              {{ errors.nome_fantasia }}
            </p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Senha</label>
            <input
              v-model="form.password"
              type="password"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.password }"
              required
              @input="validatePassword()"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
          </div>

        </div>

        <!-- Step 2: documentos -->
        <div v-if="currentStep === 2" class="grid flex-1 content-start grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">CNPJ</label>
            <input
              :value="form.documento"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.documento }"
              placeholder="00.000.000/0000-00"
              maxlength="18"
              required
              @input="applyDocumentMask"
            />
            <p v-if="errors.documento" class="mt-1 text-sm text-red-600">{{ errors.documento }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Telefone</label>
            <input
              :value="form.phone"
              type="tel"
              inputmode="numeric"
              autocomplete="tel-national"
              placeholder="(00) 00000-0000"
              maxlength="15"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.phone }"
              required
              @input="applyPhoneMask"
              @blur="validatePhone()"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">{{ errors.phone }}</p>
          </div>

          <div v-if="form.type !== 'delivery'" class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">
              {{ form.type === 'producer' ? 'Segmento de atividade' : 'Tipo de negócio' }}
            </label>
            <select
              v-if="form.type === 'producer'"
              v-model="form.activity_segment"
              class="h-12 w-full cursor-pointer rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              required
            >
              <option value="vegetables">Hortaliças</option>
              <option value="fruits">Frutas</option>
              <option value="tubers_roots">Tubérculos e raízes</option>
              <option value="herbs_spices">Ervas e especiarias</option>
              <option value="grains">Grãos</option>
              <option value="specialty">Especialidades</option>
            </select>
            <select
              v-else-if="form.type === 'retailer'"
              v-model="form.business_type"
              class="h-12 w-full cursor-pointer rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              required
            >
              <option value="supermarket">Supermercado</option>
              <option value="hortifruti">Hortifruti</option>
              <option value="restaurant">Restaurante</option>
            </select>
          </div>

          <template v-if="form.type === 'delivery'">
            <div class="min-w-0">
              <label class="mb-2 block text-sm font-semibold text-[#56665D]">Número da CNH</label>
              <input
                v-model="form.cnh_number"
                type="text"
                inputmode="numeric"
                maxlength="11"
                placeholder="11 dígitos"
                class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
                :class="{ 'border-red-500': errors.cnh_number }"
                required
                @input="form.cnh_number = form.cnh_number.replace(/\D/g, '').slice(0, 11)"
              />
              <p v-if="errors.cnh_number" class="mt-1 text-sm text-red-600">{{ errors.cnh_number }}</p>
            </div>

            <div class="min-w-0">
              <label class="mb-2 block text-sm font-semibold text-[#56665D]">Categoria da CNH</label>
              <select
                v-model="form.cnh_category"
                class="h-12 w-full cursor-pointer rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
                required
              >
                <option value="A">Categoria A</option>
                <option value="B">Categoria B</option>
                <option value="C">Categoria C</option>
                <option value="D">Categoria D</option>
                <option value="E">Categoria E</option>
                <option value="AB">Categoria AB</option>
                <option value="AC">Categoria AC</option>
                <option value="AD">Categoria AD</option>
                <option value="AE">Categoria AE</option>
              </select>
            </div>

            <div class="min-w-0">
              <label class="mb-2 block text-sm font-semibold text-[#56665D]">Placa do veículo</label>
              <input
                v-model="form.vehicle_plate"
                type="text"
                maxlength="8"
                placeholder="ABC1D23"
                class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] uppercase outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
                :class="{ 'border-red-500': errors.vehicle_plate }"
                required
                @input="form.vehicle_plate = form.vehicle_plate.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)"
              />
              <p v-if="errors.vehicle_plate" class="mt-1 text-sm text-red-600">{{ errors.vehicle_plate }}</p>
            </div>

            <div class="min-w-0">
              <label class="mb-2 block text-sm font-semibold text-[#56665D]">Tipo de carga</label>
              <select
                v-model="form.cargo_type"
                class="h-12 w-full cursor-pointer rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
                required
              >
                <option value="dry">Carga Seca</option>
                <option value="climate_controlled">Climatizada</option>
                <option value="refrigerated">Refrigerada</option>
              </select>
            </div>

            <div class="min-w-0">
              <label for="vehicle_capacity" class="mb-2 block text-sm font-semibold text-[#56665D]">
                Capacidade do veículo (kg)
              </label>
              <input
                id="vehicle_capacity"
                v-model.number="form.vehicle_capacity"
                type="number"
                min="0.01"
                step="0.01"
                class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
                :class="{ 'border-red-500': errors.vehicle_capacity }"
                required
                @input="errors.vehicle_capacity && validateDeliveryFields()"
              />
              <p v-if="errors.vehicle_capacity" class="mt-1 text-sm text-red-600">{{ errors.vehicle_capacity }}</p>
            </div>
          </template>

        </div>

        <!-- Step 3: endereços -->
        <div v-if="currentStep === 3" class="grid flex-1 content-start grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">CEP</label>
            <div class="relative">
              <input
                :value="form.cep"
                type="text"
                class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
                :class="{ 'border-red-500': errors.cep, 'bg-gray-50': isSearchingCep }"
                placeholder="00000-000"
                maxlength="9"
                required
                :disabled="isSearchingCep"
                @input="applyCepMask"
                @blur="handleCepBlur"
              />
              <div v-if="isSearchingCep" class="absolute top-1/2 right-3 -translate-y-1/2">
                <svg
                  class="h-5 w-5 animate-spin text-green-800"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            </div>
            <p v-if="errors.cep" class="mt-1 text-sm text-red-600">{{ errors.cep }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Rua</label>
            <input
              v-model="form.rua"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.rua }"
              required
              @input="errors.rua && validateRua()"
            />
            <p v-if="errors.rua" class="mt-1 text-sm text-red-600">{{ errors.rua }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Número</label>
            <input
              v-model="form.numero"
              maxlength="20"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.numero }"
              required
              @input="errors.numero && validateNumero()"
            />
            <p v-if="errors.numero" class="mt-1 text-sm text-red-600">{{ errors.numero }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Bairro</label>
            <input
              v-model="form.bairro"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.bairro }"
              required
              @input="errors.bairro && validateBairro()"
            />
            <p v-if="errors.bairro" class="mt-1 text-sm text-red-600">{{ errors.bairro }}</p>
          </div>

          <div class="min-w-0">
            <label class="mb-2 block text-sm font-semibold text-[#56665D]">Cidade</label>
            <input
              v-model="form.cidade"
              type="text"
              class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
              :class="{ 'border-red-500': errors.cidade }"
              required
              @input="errors.cidade && validateCidade()"
            />
            <p v-if="errors.cidade" class="mt-1 text-sm text-red-600">{{ errors.cidade }}</p>
          </div>

          <div class="min-w-0">
            <AppSelect
              v-model="form.estado"
              :options="stateOptions"
              :loading="isLoadingStates"
              label="Estado"
              placeholder="Selecione o estado"
              required
              :error="errors.estado"
              class="[&_label]:mb-2 [&_label]:text-sm [&_label]:font-semibold [&_label]:text-[#56665D] [&_select]:h-12 [&_select]:cursor-pointer [&_select]:rounded-[11px] [&_select]:border-[#DFE3D9] [&_select]:px-3.5 [&_select]:py-3 [&_select]:text-sm [&_select]:focus:border-[#287A4E] [&_select]:focus:ring-2 [&_select]:focus:ring-[#D6E8A7]"
            />
          </div>
        </div>

        <div class="mt-auto flex justify-between pt-8">
          <button
            v-if="currentStep > 1"
            type="button"
            class="h-12 min-w-[150px] cursor-pointer rounded-full border border-[#DFE3D9] px-4 text-sm font-semibold text-[#287A4E] transition hover:bg-[#F7F5EF] disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isLoading"
            @click="prevStep"
          >
            Anterior
          </button>
          <button
            type="submit"
            class="flex h-12 min-w-[150px] cursor-pointer items-center justify-center rounded-full bg-[#287A4E] px-4 text-sm font-semibold text-white transition hover:bg-[#226640] disabled:cursor-not-allowed disabled:opacity-70"
            :disabled="isLoading"
          >
            <svg
              v-if="isLoading && currentStep === 3"
              class="mr-2 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="currentStep < 3">Próximo</span>
            <span v-else>{{ isLoading ? 'Cadastrando...' : 'Cadastrar' }}</span>
          </button>
        </div>
      </form>

      <RouterLink to="/login" class="mt-6 block text-center text-sm text-[#287A4E] hover:underline">
        Já tem uma conta?
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { fetchAddressByCep, fetchStates } from '@/services/brasilApi';
import AppSelect from '@/components/ui/AppSelect.vue';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const currentStep = ref(1);
const isSearchingCep = ref(false);
const isLoadingStates = ref(false);
const isLoading = ref(false);
const lastSearchedCep = ref('');

const route = useRoute();

const initialType = ['producer', 'retailer', 'delivery', 'PRODUCER', 'RETAILER', 'DELIVERY'].includes(route.query.type)
  ? String(route.query.type).toLowerCase()
  : 'producer';

const form = reactive({
  name: '',
  email: '',
  type: initialType,
  password: '',
  documento: '',
  nome_fantasia: '',
  phone: '',
  activity_segment: 'vegetables',
  business_type: 'supermarket',
  cnh_number: '',
  cnh_category: 'B',
  vehicle_plate: '',
  vehicle_capacity: '',
  cargo_type: 'dry',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
  cep: '',
});

const errors = reactive({
  name: '',
  email: '',
  nome_fantasia: '',
  password: '',
  phone: '',
  documento: '',
  cnh_number: '',
  vehicle_plate: '',
  vehicle_capacity: '',
  cep: '',
  rua: '',
  numero: '',
  bairro: '',
  cidade: '',
  estado: '',
});

const stateOptions = ref([]);

onMounted(async () => {
  isLoadingStates.value = true;
  try {
    const data = await fetchStates();
    stateOptions.value = data
      .map((s) => ({
        label: `${s.nome} (${s.sigla})`,
        value: s.sigla,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch {
    // Silencia falha ao carregar estados
  } finally {
    isLoadingStates.value = false;
  }
});

watch(
  () => form.cep,
  (newVal) => {
    errors.cep = '';
    const cleanCep = newVal.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      lastSearchedCep.value = '';
    } else if (cleanCep.length === 8 && !isSearchingCep.value) {
      handleCepBlur();
    }
  },
);

watch(
  () => form.estado,
  () => {
    errors.estado = '';
  },
);

const nextStep = async () => {
  if (currentStep.value === 1) {
    if (!validateName()) {
      toast.warning('O campo Nome Completo é obrigatório.', 'Nome Completo Inválido');
      return;
    }
    if (!validateEmail()) {
      toast.warning(errors.email, 'Email Inválido');
      return;
    }

    if (!validateNomeFantasia()) {
      toast.warning(
        'O campo Nome fantasia / Razão social é obrigatório.',
        'Nome Fantasia Inválido',
      );
      return;
    }
    if (!validatePassword()) {
      toast.warning(errors.password, 'Senha Inválida');
      return;
    }
  } else if (currentStep.value === 2) {
    if (!validateDocumento()) {
      toast.warning(errors.documento, 'Documento Inválido');
      return;
    }

    if (!validatePhone()) {
      toast.warning(errors.phone, 'Telefone Inválido');
      return;
    }

    if (form.type === 'delivery' && !validateDeliveryFields()) {
      return;
    }

  }
  if (currentStep.value < 3) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const maskCNPJ = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskCEP = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const applyDocumentMask = (event) => {
  form.documento = maskCNPJ(event.target.value);
  if (errors.documento) {
    validateDocumento();
  }
};

const applyCepMask = (event) => {
  form.cep = maskCEP(event.target.value);
};

const applyPhoneMask = (event) => {
  form.phone = event.target.value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
  event.target.value = form.phone;
  if (errors.phone) {
    validatePhone();
  }
};

const validateCep = (showError = true) => {
  const cep = form.cep.replace(/\D/g, '');
  if (!cep) {
    if (showError) errors.cep = 'O CEP é obrigatório.';
    return false;
  }
  if (cep.length !== 8) {
    if (showError) errors.cep = 'CEP inválido.';
    return false;
  }
  if (errors.cep && errors.cep !== 'CEP inválido.' && errors.cep !== 'O CEP é obrigatório.') {
    return false;
  }
  if (showError) errors.cep = '';
  return true;
};

const handleCepBlur = async () => {
  if (isSearchingCep.value) return;
  const cep = form.cep.replace(/\D/g, '');
  if (cep === lastSearchedCep.value) return;

  const isValid = validateCep(false);
  if (!isValid) return;

  isSearchingCep.value = true;
  try {
    const data = await fetchAddressByCep(cep);
    form.rua = data.street || '';
    form.bairro = data.neighborhood || '';
    form.cidade = data.city || '';
    form.estado = data.state || '';
    errors.cep = '';
    lastSearchedCep.value = cep;
  } catch {
    errors.cep = 'CEP não encontrado ou erro na busca.';
    lastSearchedCep.value = '';
  } finally {
    isSearchingCep.value = false;
  }
};

const validateDocumento = () => {
  const doc = form.documento.replace(/\D/g, '');
  if (!doc) {
    errors.documento = 'O documento é obrigatório.';
    return false;
  }
  if (doc.length !== 14) {
    errors.documento = 'O CNPJ da empresa deve ter 14 dígitos.';
    return false;
  }
  errors.documento = '';
  return true;
};

const validatePassword = () => {
  if (!form.password) {
    errors.password = 'A senha é obrigatória.';
    return false;
  }
  if (form.password.length < 8) {
    errors.password = 'A senha deve ter pelo menos 8 caracteres.';
    return false;
  }
  errors.password = '';
  return true;
};

const validatePhone = () => {
  if (form.phone.replace(/\D/g, '').length !== 11) {
    errors.phone = 'Informe um telefone com DDD e 11 dígitos. Ex.: (00) 00000-0000.';
    return false;
  }
  errors.phone = '';
  return true;
};

const validateDeliveryFields = () => {
  if (!/^\d{11}$/.test(form.cnh_number)) {
    errors.cnh_number = 'A CNH deve conter exatamente 11 dígitos.';
    toast.warning(errors.cnh_number, 'CNH Inválida');
    return false;
  }
  errors.cnh_number = '';

  if (!/^[A-Z0-9]{7,8}$/.test(form.vehicle_plate)) {
    errors.vehicle_plate = 'Informe uma placa com 7 ou 8 letras e números.';
    toast.warning(errors.vehicle_plate, 'Placa Inválida');
    return false;
  }
  errors.vehicle_plate = '';
  if (!Number.isFinite(Number(form.vehicle_capacity)) || Number(form.vehicle_capacity) <= 0) {
    errors.vehicle_capacity = 'Informe uma capacidade maior que zero.';
    toast.warning(errors.vehicle_capacity, 'Capacidade Inválida');
    return false;
  }
  errors.vehicle_capacity = '';
  return true;
};

const validateName = () => {
  if (!form.name || !form.name.trim()) {
    errors.name = 'O nome completo é obrigatório.';
    return false;
  }
  if (form.name.trim().length > 100) {
    errors.name = 'O nome completo deve ter no máximo 100 caracteres.';
    return false;
  }
  errors.name = '';
  return true;
};

const validateEmail = () => {
  if (!form.email || !form.email.trim()) {
    errors.email = 'O e-mail é obrigatório.';
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (form.email.trim().length > 100 || !emailRegex.test(form.email)) {
    errors.email = 'Insira um e-mail válido.';
    return false;
  }
  errors.email = '';
  return true;
};

const validateNomeFantasia = () => {
  if (!form.nome_fantasia || !form.nome_fantasia.trim()) {
    errors.nome_fantasia = 'O nome fantasia / razão social é obrigatório.';
    return false;
  }
  if (form.nome_fantasia.trim().length > 100) {
    errors.nome_fantasia = 'O nome fantasia deve ter no máximo 100 caracteres.';
    return false;
  }
  errors.nome_fantasia = '';
  return true;
};

const validateRua = () => {
  if (!form.rua || !form.rua.trim()) {
    errors.rua = 'A rua é obrigatória.';
    return false;
  }
  errors.rua = '';
  return true;
};

const validateNumero = () => {
  if (!form.numero || !form.numero.trim()) {
    errors.numero = 'O número é obrigatório.';
    return false;
  }
  if (form.numero.trim().length > 20) {
    errors.numero = 'O número deve ter no máximo 20 caracteres.';
    return false;
  }
  errors.numero = '';
  return true;
};

const validateBairro = () => {
  if (!form.bairro || !form.bairro.trim()) {
    errors.bairro = 'O bairro é obrigatório.';
    return false;
  }
  errors.bairro = '';
  return true;
};

const validateCidade = () => {
  if (!form.cidade || !form.cidade.trim()) {
    errors.cidade = 'A cidade é obrigatória.';
    return false;
  }
  errors.cidade = '';
  return true;
};

const validateEstado = () => {
  if (!form.estado) {
    errors.estado = 'Selecione um estado.';
    return false;
  }
  errors.estado = '';
  return true;
};

const handleCadastro = async () => {
  // Garantir que a busca do CEP foi feita se o campo estiver preenchido
  if (form.cep.replace(/\D/g, '').length === 8 && !form.rua) {
    await handleCepBlur();
  }

  // Validar campos antes de enviar em ordem
  if (!validateCep()) {
    toast.warning(errors.cep, 'CEP Inválido');
    return;
  }
  if (!validateRua()) {
    toast.warning(errors.rua, 'Rua Inválida');
    return;
  }
  if (!validateNumero()) {
    toast.warning(errors.numero, 'Número Inválido');
    return;
  }
  if (!validateBairro()) {
    toast.warning(errors.bairro, 'Bairro Inválido');
    return;
  }
  if (!validateCidade()) {
    toast.warning(errors.cidade, 'Cidade Inválida');
    return;
  }
  if (!validateEstado()) {
    toast.warning(errors.estado, 'Estado Inválido');
    return;
  }

  isLoading.value = true;

  try {
    const signupPayload = {
      profile_type: form.type.toLowerCase(),
      user: {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password,
      },
      company: {
        trade_name: form.nome_fantasia.trim(),
        legal_name: form.nome_fantasia.trim(),
        document_number: form.documento.replace(/\D/g, ''),
        phone: form.phone.replace(/\D/g, ''),
        address: {
          zip: form.cep.replace(/\D/g, ''),
          number: form.numero.trim(),
          complement: '',
          reference_point: null,
        },
      },
      ...(form.type === 'producer'
        ? {
            producer: {
              activity_segment: form.activity_segment,
            },
          }
        : {}),
      ...(form.type === 'retailer'
        ? {
            retailer: {
              business_type: form.business_type,
            },
          }
        : {}),
      ...(form.type === 'delivery'
        ? {
            delivery: {
              cnh_number: form.cnh_number,
              cnh_category: form.cnh_category,
              vehicle: {
                plate: form.vehicle_plate,
                cargo_type: form.cargo_type,
                capacity: form.vehicle_capacity,
              },
            },
          }
        : {}),
    };
    await authStore.signup(signupPayload);

    toast.success(
      'Sua conta foi criada com sucesso! Seja bem-vindo à nossa plataforma.',
      'Cadastro Concluído',
      {
        duration: 5000,
      },
    );
    router.push('/dashboard');
  } catch (error) {
    toast.error(error?.message || 'Não foi possível concluir seu cadastro.', 'Falha no Cadastro');
  } finally {
    isLoading.value = false;
  }
};
</script>
