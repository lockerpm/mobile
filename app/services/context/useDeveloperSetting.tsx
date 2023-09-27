import React, { createContext, useContext, useState } from 'react'
// import { useTheme } from "./useTheme"
// import { useStores } from "app/models"
import { Modal } from 'react-native'
import { Screen } from 'app/components-v2/cores'

const DeveloperSettingsContext: React.Context<{
  setIsOpenDeveloperSettingModal: (val: boolean) => void
}> = createContext({
  setIsOpenDeveloperSettingModal: (_val: boolean) => null,
})

// wrap
function DeveloperSettingsContextProvider({ children }) {
  // const {  setIsDark } = useTheme()
  // const { user } = useStores()
  const [isOpenDeveloperSettingsModal, setIsOpenDeveloperSettingModal] = useState(false)

  return (
    <DeveloperSettingsContext.Provider
      value={{
        setIsOpenDeveloperSettingModal,
      }}
    >
      {children}
      <Modal animationType="fade" visible={isOpenDeveloperSettingsModal}>
        <Screen
          preset="auto"
          safeAreaEdges={['top', 'bottom']}
          contentContainerStyle={{ flex: 1 }}
        ></Screen>
      </Modal>
    </DeveloperSettingsContext.Provider>
  )
}
const useDeveloperSettings = () => useContext(DeveloperSettingsContext)

export { useDeveloperSettings, DeveloperSettingsContextProvider }
