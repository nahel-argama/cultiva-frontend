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

    <div class="flex min-h-[520px] w-full max-w-[500px] flex-col rounded-[24px] border border-[#DFE3D9] bg-white p-8 sm:p-10">
      <h2 class="mb-12 text-center font-display text-[34px] leading-[42px] font-semibold text-[#287A4E]">Login</h2>

      <!-- Mensagem de erro -->
      <div v-if="errorMessage" class="mb-4 rounded-lg bg-red-50 p-4">
        <p class="text-center text-sm font-medium text-red-800">{{ errorMessage }}</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-7">
          <label class="mb-2 block text-sm font-semibold text-[#56665D]">Email</label>
          <input
            v-model="credenciais.email"
            type="email"
            class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
            :disabled="isLoading"
            required
          />
        </div>

        <div class="mb-9">
          <label class="mb-2 block text-sm font-semibold text-[#56665D]">Senha</label>
          <input
            v-model="credenciais.password"
            type="password"
            class="h-12 w-full rounded-[11px] border border-[#DFE3D9] bg-white px-3.5 py-3 text-sm text-[#56665D] outline-none focus:border-[#287A4E] focus:ring-2 focus:ring-[#D6E8A7]"
            :disabled="isLoading"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="h-12 w-full cursor-pointer rounded-full bg-[#287A4E] px-4 text-sm font-semibold text-white transition hover:bg-[#226640] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {{ isLoading ? 'Entrando...' : 'Entrar' }}
        </button>

        <div class="mt-8 text-center">
          <RouterLink to="/register" class="text-sm text-[#287A4E] hover:underline">
            Não possui conta?
          </RouterLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

const router = useRouter();
const { login: authLogin } = useAuth();

const isLoading = ref(false);
const credenciais = reactive({
  email: '',
  password: '',
});

const errorMessage = ref('');

/**
 * Manipulador de login
 *
 * Delega toda lógica de autenticação para o auth store via composable.
 * Este componente cuida apenas de:
 * - UI do formulário
 * - Seu próprio estado de loading e erros
 */
const handleLogin = async () => {
  try {
    errorMessage.value = '';
    isLoading.value = true;

    // Valida campos
    if (!credenciais.email || !credenciais.password) {
      errorMessage.value = 'Por favor, preencha todos os campos.';
      return;
    }

    // Chama login centralizado (store)
    await authLogin(credenciais);

    // Se chegou aqui, login foi sucesso
    // Store já salvou token e Pinia está atualizado
    router.push('/dashboard'); // Redireciona para o dashboard adaptativo
  } catch (error) {
    // Trata mensagem de erro do backend
    const msg =
      error?.payload?.message ||
      error?.payload?.errors?.email?.[0] ||
      error?.message ||
      'Credenciais inválidas. Tente novamente.';

    errorMessage.value = msg;
  } finally {
    isLoading.value = false;
  }
};
</script>
