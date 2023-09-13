import React, { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { Button, Header, Layout, Text } from "../../../../components"
import { commonStyles, fontSize } from "../../../../theme"

import DataBreachScannerIcon from './data-breach-scanner.svg'
import { useStores } from "../../../../models"
import { LoadingHeader } from "./loading-header"
import { useCipherToolsMixins } from "../../../../services/mixins/cipher/tools"
import { AppEventType, EventBus } from "../../../../utils/eventBus"
import { PasswordHealthQueue } from "../../../../utils/queue"



export const PasswordHealthScreen = observer(function PasswordHealthScreen() {
  const { translate, color } = useMixins()
  const navigation = useNavigation()

  const { toolStore, cipherStore } = useStores()
  const { loadPasswordsHealth } = useCipherToolsMixins()


  useEffect(() => {
    if (!(cipherStore.isSynching || cipherStore.isBatchDecrypting)) {
      toolStore.setDataLoading(false)
    }
  }, [cipherStore.isSynching, cipherStore.isBatchDecrypting])
  useEffect(() => {
    if (!toolStore.lastHealthCheck && !toolStore.isDataLoading) {
      PasswordHealthQueue.clear()
      PasswordHealthQueue.add(loadPasswordsHealth)
    }
  }, [toolStore.lastHealthCheck, toolStore.isDataLoading])

  // Recalculate password health
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.PASSWORD_UPDATE, () => {
      PasswordHealthQueue.clear()
      PasswordHealthQueue.add(loadPasswordsHealth)
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  // -------------------- RENDER ----------------------

  // Render warning counter
  const renderWarningCounter = (count: number) => (
    <View
      style={{
        height: 40,
        width: 40,
        backgroundColor: count > 0 ? color.error : color.primary,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text
        preset="bold"
        text={count.toString()}
        style={{
          fontSize: fontSize.p,
          color: color.white
        }}
      />
    </View>
  )

  // Render an option
  const renderOption = (title: string, desc: string, left: React.ReactNode, action: () => void, bordered?: boolean) => (
    <Button
      preset="link"
      onPress={action}
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        borderBottomColor: color.line,
        borderBottomWidth: bordered ? 1 : 0,
        justifyContent: 'space-between',
        paddingVertical: 16,
      }]}
    >
      <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        flex: 1
      }]}>
        {left}

        <View style={{ paddingHorizontal: 10, flex: 1 }}>
          <Text
            preset="black"
            text={title}
          />
          <Text
            text={desc}
            style={{
              marginTop: 3,
              fontSize: fontSize.small
            }}
          />
        </View>
      </View>

      <FontAwesomeIcon
        name="angle-right"
        size={18}
        color={color.textBlack}
      />
    </Button>
  )

  // Render screen
  return (
    <Layout
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
        paddingTop: 0
      }}
      header={(
        <Header
          title={translate('pass_health.title')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 30 }} />
          )}
        />
      )}
    >
      <View style={{ marginBottom: 16 }}>
        <LoadingHeader />
      </View>

      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background
      }]}>
        {
          renderOption(
            translate('pass_health.weak_passwords.name'),
            translate('pass_health.weak_passwords.desc'),
            renderWarningCounter(toolStore.weakPasswords.length),
            () => navigation.navigate('weakPasswordList'),
            true
          )
        }
        {
          renderOption(
            translate('pass_health.reused_passwords.name'),
            translate('pass_health.reused_passwords.desc'),
            renderWarningCounter(toolStore.reusedPasswords.length),
            () => navigation.navigate('reusePasswordList'),
            true
          )
        }
        {
          renderOption(
            translate('pass_health.exposed_passwords.name'),
            translate('pass_health.exposed_passwords.desc'),
            (
              <DataBreachScannerIcon height={40} width={40} />
            ),
            () => navigation.navigate('exposedPasswordList'),
          )
        }
      </View>
    </Layout>
  )
})
