import React, { FC } from 'react'
import { Screen, Header, Button, Text, AutoImage as Image } from 'app/components/cores'
import { View } from 'react-native'
import { AppStackScreenProps } from 'app/navigators'
import { useCipherData, useHelper } from 'app/services/hook'
import { useStores } from 'app/models'
import { translate } from 'app/i18n'
import { observer } from 'mobx-react-lite'

const DATA_IMG = require('assets/images/intro/intro1.png')

export const DataOutdatedScreen: FC<AppStackScreenProps<'dataOutdated'>> = observer((props) => {
  const navigation = props.navigation
  const { notify } = useHelper()
  const { cipherStore } = useStores()
  const { startSyncProcess } = useCipherData()

  // ------------------------- METHODS ----------------------------

  const syncDataManually = async () => {
    const res = await startSyncProcess(Date.now())

    // @ts-ignore
    if (res.kind === 'ok') {
      notify('success', translate('success.sync_success'))
    }
  }

  return (
    <Screen
      preset="auto"
      padding
      safeAreaEdges={['bottom']}
      header={<Header leftIcon="arrow-left" onLeftPress={() => navigation.goBack()} />}
    >
      <View
        style={{
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <Image
          source={DATA_IMG}
          style={{
            width: '100%',
          }}
        />
        <Text
          preset="bold"
          size="xl"
          text={'OOPS!'}
          style={{
            marginTop: 16,
            marginBottom: 10,
          }}
        />
        <Text preset="label" text={translate('outdated_data.desc')} style={{ lineHeight: 24 }} />
        <Button
          loading={cipherStore.isSynching}
          disabled={cipherStore.isSynching}
          onPress={syncDataManually}
          text={
            cipherStore.isSynching
              ? translate('outdated_data.synchronizing')
              : translate('common.synchronize')
          }
          style={{
            marginTop: 32,
            marginBottom: 16,
          }}
        />
        <Button
          preset="secondary"
          onPress={() => navigation.goBack()}
          text={translate('outdated_data.go_back')}
          style={{
            width: '100%',
          }}
        />
      </View>
    </Screen>
  )
})
