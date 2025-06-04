import React, { FC, useEffect } from "react"
import { StyleSheet, View } from "react-native"
import {
  Header,
  Icon,
  ImageIcon,
  ImageIconTypes,
  PressableScale,
  Screen,
  Text,
} from "app/components/cores"
import { LoadingHeader } from "../LoadingHeader"
import { useTheme } from "app/services/context"
import { useStores } from "app/models"
import { useTool } from "app/services/hook"
import { PasswordHealthQueue } from "app/utils/queue"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { PasswordHealthStackScreenProps } from "app/navigators/navigators.types"
import { TxKeyPath } from "app/i18n"

export const PasswordHealthScreen: FC<PasswordHealthStackScreenProps<"passwordHealth">> = observer(
  ({ navigation }) => {
    const { colors } = useTheme()
    const { toolStore, cipherStore } = useStores()
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

    // ----------------------- RENDER -------------------------

    // Render screen
    return (
      <Screen
        backgroundColor={colors.block}
        header={
          <Header
            titleTx="pass_health.title"
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
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
            title="pass_health.weak_passwords.name"
            desc="pass_health.weak_passwords.desc"
            warningCount={toolStore.weakPasswords.length}
            action={() => navigation.navigate("weakPasswordList")}
            bordered
          />
          <Options
            bordered
            title="pass_health.reused_passwords.name"
            desc="pass_health.reused_passwords.desc"
            warningCount={toolStore.reusedPasswords.length}
            action={() => navigation.navigate("reusePasswordList")}
          />
          <Options
            title="pass_health.exposed_passwords.name"
            desc="pass_health.exposed_passwords.desc"
            warningCount={0}
            leftIcon={"data-breach-scanner"}
            action={() => navigation.navigate("exposedPasswordList")}
          />
        </View>
      </Screen>
    )
  },
)

type OptionsProps = {
  title: TxKeyPath
  desc: TxKeyPath
  warningCount: number
  leftIcon?: ImageIconTypes
  action: () => void
  bordered?: boolean
}
// Render an option
const Options = ({ title, desc, warningCount, leftIcon, action, bordered }: OptionsProps) => {
  const { colors } = useTheme()
  return (
    <PressableScale onPress={action}>
      <View
        style={[
          styles.optionsContainer,
          {
            borderBottomColor: colors.border,
            borderBottomWidth: bordered ? 1 : 0,
          },
        ]}
      >
        <View style={styles.optionContent}>
          {warningCount > 0 && <WarningCounter count={warningCount} />}
          {!!leftIcon && <ImageIcon icon={leftIcon} size={40} />}

          <View style={styles.optionText}>
            <Text tx={title} />
            <Text preset="label" tx={desc} size="base" style={styles.mt4} />
          </View>
        </View>

        <Icon icon="caret-right" size={20} color={colors.secondaryText} />
      </View>
    </PressableScale>
  )
}

// Render warning counter
const WarningCounter = ({ count }: { count: number }) => {
  const { colors } = useTheme()
  return (
    <View
      style={[
        styles.warningCounter,
        {
          backgroundColor: count > 0 ? colors.error : colors.primary,
        },
      ]}
    >
      <Text preset="bold" text={count.toString()} color={colors.white} />
    </View>
  )
}

const styles = StyleSheet.create({
  mt4: {
    marginTop: 4,
  },
  optionContent: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  optionText: {
    flex: 1,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  warningCounter: {
    alignItems: "center",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
})
