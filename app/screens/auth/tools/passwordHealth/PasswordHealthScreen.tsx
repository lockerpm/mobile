import React, { FC, useEffect } from "react"
import { TouchableOpacity, View } from "react-native"
import { Header, Icon, ImageIcon, Screen, Text } from "app/components/cores"
import { LoadingHeader } from "./LoadingHeader"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useHelper, useTool } from "app/services/hook"
import { PasswordHealthQueue } from "app/utils/queue"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { ToolsStackScreenProps } from "app/navigators/navigators.types"

export const PasswordHealthScreen: FC<ToolsStackScreenProps<"passwordHealth">> = observer(
  (props) => {
    const navigation = props.navigation
    const { colors } = useTheme()
    const { toolStore, cipherStore } = useStores()
    const { translate } = useHelper()
    const { loadPasswordsHealth } = useTool()

    // -------------------- EFFECT ----------------------

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
          backgroundColor: count > 0 ? colors.error : colors.primary,
          borderRadius: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text preset="bold" text={count.toString()} color={colors.white} />
      </View>
    )

    // Render screen
    return (
      <Screen
        backgroundColor={colors.block}
        header={
          <Header
            title={translate("pass_health.title")}
            leftIcon="arrow-left"
            onLeftPress={() => navigation.goBack()}
          />
        }
      >
        <LoadingHeader />

        <View
          style={{
            backgroundColor: colors.background,
            paddingHorizontal: 16,
            marginHorizontal: 20,
            marginTop: 20,
            borderRadius: 12,
          }}
        >
          <Options
            title={translate("pass_health.weak_passwords.name")}
            desc={translate("pass_health.weak_passwords.desc")}
            left={renderWarningCounter(toolStore.weakPasswords.length)}
            action={() => navigation.navigate("weakPasswordList")}
            bordered
          />
          <Options
            bordered
            title={translate("pass_health.reused_passwords.name")}
            desc={translate("pass_health.reused_passwords.desc")}
            left={renderWarningCounter(toolStore.reusedPasswords.length)}
            action={() => navigation.navigate("reusePasswordList")}
          />
          <Options
            title={translate("pass_health.exposed_passwords.name")}
            desc={translate("pass_health.exposed_passwords.desc")}
            left={<ImageIcon icon="data-breach-scanner" size={40} />}
            action={() => navigation.navigate("exposedPasswordList")}
          />
        </View>
      </Screen>
    )
  },
)

// Render an option
const Options = ({
  title,
  desc,
  left,
  action,
  bordered,
}: {
  title: string
  desc: string
  left: React.ReactNode
  action: () => void
  bordered?: boolean
}) => {
  const { colors } = useTheme()
  return (
    <TouchableOpacity onPress={action}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderBottomColor: colors.border,
          borderBottomWidth: bordered ? 1 : 0,
          justifyContent: "space-between",
          paddingVertical: 16,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {left}

          <View style={{ paddingHorizontal: 10, flex: 1 }}>
            <Text text={title} />
            <Text
              preset="label"
              text={desc}
              size="base"
              style={{
                marginTop: 3,
              }}
            />
          </View>
        </View>

        <Icon icon="caret-right" size={20} color={colors.primaryText} />
      </View>
    </TouchableOpacity>
  )
}
