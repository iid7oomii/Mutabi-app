import { create } from 'zustand'
import { API_BASE_URL } from '../config';

const useAuthStore = create((set, get) => ({
  user:         null,
  subscription: null,
  loading:      true,

  setUser:      (user) => set({ user }),
  setLoading:   (loading) => set({ loading }),
  clearUser:    () => set({ user: null, subscription: null }),

  fetchUser: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
        credentials: 'include',
      })
      if (!res.ok) {
        set({ user: null, subscription: null, loading: false })
        return null
      }
      const data = await res.json()

      // SUBSCRIPTION FETCH DISABLED
      // if (data.role === 'admin') {
      //   try {
      //     const subRes = await fetch(`${API_BASE_URL}/api/v1/subscriptions/current`, {
      //       credentials: 'include',
      //     })
      //     const subData = subRes.ok ? await subRes.json() : null
      //     set({ user: data, subscription: subData, loading: false })
      //   } catch {
      //     set({ user: data, subscription: null, loading: false })
      //   }
      // } else {
      //   set({ user: data, loading: false })
      // }
      set({ user: data, loading: false })

      return data
    } catch {
      set({ user: null, subscription: null, loading: false })
      return null
    }
  },

  refreshSubscription: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/subscriptions/current`, {
        credentials: 'include',
      })
      const data = res.ok ? await res.json() : null
      set({ subscription: data })
      return data
    } catch {
      return null
    }
  },
}))

export default useAuthStore
