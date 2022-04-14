import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Header, Layout, Text, FloatingInput, Button } from "../../../../components"
import { useMixins } from "../../../../services/mixins"
import { useNavigation } from "@react-navigation/core"
import { useStores } from "../../../../models"


export const DataBreachScannerScreen = observer(function DataBreachScannerScreen() {
  const { translate, notifyApiError, color } = useMixins()
  const navigation = useNavigation()
  const { toolStore } = useStores()

  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const handleCheck = async () => {
    setIsError(false)
    setIsLoading(true)
    
    const res = await toolStore.checkBreaches(email)
    if (res.kind !== 'ok') {
      setIsError(true)
      notifyApiError(res)
    } else {
      toolStore.setBreachedEmail(email)
      toolStore.setBreaches(res.data)
      navigation.navigate('dataBreachList')
    }

    setIsLoading(false)
  }

  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={translate('data_breach_scanner.title')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 30 }} />
          )}
        />
      )}
    >
      <View
        style={{
          backgroundColor: color.background,
          paddingHorizontal: 20,
          paddingVertical: 16
        }}
      >
        <Text
          preset="black"
          text={translate('data_breach_scanner.breach_desc')}
          style={{
            marginBottom: 10
          }}
        />

        <FloatingInput
          label={translate('data_breach_scanner.check_email')}
          value={email}
          onChangeText={setEmail}
          isInvalid={isError}
          onSubmitEditing={handleCheck}
          style={{
            marginTop: 10,
            marginBottom: 30
          }}
        />

        <Button
          text={translate('data_breach_scanner.check')}
          isDisabled={isLoading || !email}
          isLoading={isLoading}
          onPress={handleCheck}
        />
      </View>
    </Layout>
  )
})
