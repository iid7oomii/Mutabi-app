import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  clearUser: () => set({ user: null }),

  fetchUser: async () => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        credentials: 'include',
      })
      if (!res.ok) {
        set({ user: null, loading: false })
        return null
      }
      const data = await res.json()
      set({ user: data, loading: false })
      return data
    } catch {
      set({ user: null, loading: false })
      return null
    }
  },
}))

export default useAuthStore