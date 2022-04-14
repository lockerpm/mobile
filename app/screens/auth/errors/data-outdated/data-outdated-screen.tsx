import React from "react"
import { observer } from "mobx-react-lite"
import { useNavigation } from "@react-navigation/native"
import { Layout, Header, Button, Text, AutoImage as Image } from "../../../../components"
import { View } from "react-native"
import { useMixins } from "../../../../services/mixins"
import { useStores } from "../../../../models"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"


export const DataOutdatedScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, notify } = useMixins()
  const { cipherStore } = useStores()
  const { startSyncProcess } = useCipherDataMixins()

  // ------------------------- PARAMS ----------------------------

  // ------------------------- METHODS ----------------------------

  const syncDataManually = async () => {
    const res = await startSyncProcess()
    if (res.kind === 'ok') {
      notify('success', translate('success.sync_success'))
    }
  }

  // --------------------------- EFFECT ----------------------------

  // ------------------------- RENDER ----------------------------

  return (
    <Layout
      header={(
        <Header goBack={() => navigation.goBack()} />
      )}
      containerStyle={{
        paddingTop: 0
      }}
    >
      <View
        style={{
          alignItems: 'center',
          paddingHorizontal: 16
        }}
      >
        <Image 
          source={require('./intro1.png')}
          style={{
            width: '100%'
          }}
        />
        <Text 
          preset="header" 
          text={'OOPS!'}
          style={{
            marginTop: 16,
            marginBottom: 10
          }}
        />
        <Text 
          text={translate('outdated_data.desc')}
          style={{ lineHeight: 24 }}
        />
        <Button
          isLoading={cipherStore.isSynching}
          disabled={cipherStore.isSynching}
          onPress={syncDataManually}
          text={cipherStore.isSynching ? translate('outdated_data.synchronizing') : translate('common.synchronize')}
          style={{
            marginTop : 32,
            marginBottom: 16,
            width: '100%'
          }}
        />
        <Button
          preset="outline"
          onPress={() => navigation.goBack()}
          text={translate('outdated_data.go_back')}
          style={{
            width: '100%'
          }}
        />
      </View>
    </Layout>
  )
})
