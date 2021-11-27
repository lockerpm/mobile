import React from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { useNavigation } from "@react-navigation/core"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { Button, Header, Layout, Text } from "../../../../components"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../../../theme"

// @ts-ignore
import DataBreachScannerIcon from './data-breach-scanner.svg'
import { useStores } from "../../../../models"


export const PasswordHealthScreen = observer(function PasswordHealthScreen() {
  const { translate } = useMixins()
  const navigation = useNavigation()
  const { toolStore, uiStore } = useStores()
  const color = uiStore.isDark ? colorDark : colorLight

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
        { left }

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
        paddingHorizontal: 0
      }}
      header={(
        <Header
          title={translate('pass_health.title')}
          goBack={() => navigation.goBack()}
          right={(
            <View style={{ width: 10 }} />
          )}
        />
      )}
    >
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
