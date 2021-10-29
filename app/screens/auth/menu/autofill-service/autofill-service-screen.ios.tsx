import React from "react"
import { observer } from "mobx-react-lite"
import { Header, Layout, Text } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { useMixins } from "../../../../services/mixins"
import { View } from "react-native"


export const AutofillServiceScreen = observer(function AutofillServiceScreen() {
  const navigation = useNavigation()
  const { translate } = useMixins()

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.autofill_service')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
    >
      <Text
        preset="black"
        text={translate("autofill_service.ios.desc")}
        style={{
          marginBottom: 20
        }}
      />
      <Text
        preset="black"
        text={translate("autofill_service.ios.step_1")}
        style={{
          marginBottom: 10
        }}
      />
      <Text
        preset="black"
        text={translate("autofill_service.ios.step_2")}
        style={{
          marginBottom: 10
        }}
      />
      <Text
        preset="black"
        text={translate("autofill_service.ios.step_3")}
        style={{
          marginBottom: 10
        }}
      />
      <Text
        preset="black"
        text={translate("autofill_service.ios.step_4")}
        style={{
          marginBottom: 10
        }}
      />
      <Text
        preset="black"
        text={translate("autofill_service.ios.step_5")}
        style={{
          marginBottom: 10
        }}
      />
    </Layout>
  )
})
