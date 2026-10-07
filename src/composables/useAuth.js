import { computed, reactive } from 'vue';
import { login as loginRequest, signup as signupRequest } from '@/services/api';

const state = reactive({
  user: JSON.parse(localStorage.getItem('cultiva.user') ?? 'null'),
  profileData: JSON.parse(localStorage.getItem('cultiva.auth_data') ?? 'null'),
  accessToken: localStorage.getItem('cultiva.access_token'),
  refreshToken: localStorage.getItem('cultiva.refresh_token'),
});

function setSession(data) {
  const tokens = data?.tokens ?? {};
  state.profileData = data
    ? {
        user: data.user ?? null,
        profile_type: data.profile_type ?? null,
        profile: data.profile ?? null,
      }
    : null;
  state.user = data?.user ?? null;
  state.accessToken = tokens.access_token ?? null;
  state.refreshToken = tokens.refresh_token ?? null;

  if (state.user) {
    localStorage.setItem('cultiva.user', JSON.stringify(state.user));
  } else {
    localStorage.removeItem('cultiva.user');
  }

  if (state.profileData) {
    localStorage.setItem('cultiva.auth_data', JSON.stringify(state.profileData));
  } else {
    localStorage.removeItem('cultiva.auth_data');
  }

  if (state.accessToken) {
    localStorage.setItem('cultiva.access_token', state.accessToken);
  } else {
    localStorage.removeItem('cultiva.access_token');
  }

  if (state.refreshToken) {
    localStorage.setItem('cultiva.refresh_token', state.refreshToken);
  } else {
    localStorage.removeItem('cultiva.refresh_token');
  }
}

export function useAuth() {
  const userType = computed(() => state.profileData?.profile_type ?? null);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    setSession(response.data);
    return response.data;
  }

  async function signup(data) {
    const response = await signupRequest(data);
    setSession(response.data);
    return response.data;
  }

  function logout() {
    setSession(null);
  }

  return {
    user: computed(() => state.user),
    userType,
    profileData: computed(() => state.profileData),
    isLoggedIn: computed(() => Boolean(state.accessToken)),
    login,
    signup,
    logout,
  };
}
