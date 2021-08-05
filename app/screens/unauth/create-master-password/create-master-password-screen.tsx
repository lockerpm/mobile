import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { Button } from 'native-base'
import { Text, Layout } from "../../../components"
import { useNavigation } from "@react-navigation/native"
// import { useStores } from "../../models"
import { useMixins } from "../../../services/mixins"


export const CreateMasterPasswordScreen = observer(function CreateMasterPasswordScreen() {
  // const { someStore, anotherStore } = useStores()
  const { logout } = useMixins()
  const navigation = useNavigation()

  // Params
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Layout
      header={() => <Text preset="header" text="Create master pass" />}
      isOverlayLoading={isLoading}
    >
      <Button
        onPress={async () => {
          setIsLoading(true)
          await logout()
          setIsLoading(false)
          navigation.navigate('onBoarding')
        }}
      >
        Logout
      </Button>
    </Layout>
  )
})
