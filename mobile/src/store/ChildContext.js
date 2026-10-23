import { createContext, useContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

const CHILD_ID_KEY = 'selected_child_id'

const ChildContext = createContext(null)

export function ChildProvider({ children }) {
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(CHILD_ID_KEY).then(id => {
      setSelectedChildId(id || null)
      setReady(true)
    })
  }, [])

  const switchChild = async (id) => {
    const sid = String(id)
    setSelectedChildId(sid)
    await AsyncStorage.setItem(CHILD_ID_KEY, sid)
  }

  const clearChild = async () => {
    setSelectedChildId(null)
    await AsyncStorage.removeItem(CHILD_ID_KEY)
  }

  return (
    <ChildContext.Provider value={{ selectedChildId, switchChild, clearChild, ready }}>
      {children}
    </ChildContext.Provider>
  )
}

export const useChild = () => useContext(ChildContext)
