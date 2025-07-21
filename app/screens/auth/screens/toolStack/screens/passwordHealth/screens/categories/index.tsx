/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { FC, useEffect } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
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
import { useStores } from "app/models"
import { useTool } from "app/services/hook"
import { PasswordHealthQueue } from "app/utils/queue"
import { AppEventType, EventBus } from "app/utils/eventBus"
import { observer } from "mobx-react-lite"
import { PasswordHealthScreenProps } from "app/navigators/navigators.types"
import { TxKeyPath } from "app/i18n"
import { useAppTheme } from "@/utils/useAppTheme"

export const PasswordHealthScreen: FC<PasswordHealthScreenProps<"passwordHealth">> = observer(
  ({ navigation }) => {
    const {
      theme: { colors },
    } = useAppTheme()
    const { toolStore, cipherStore } = useStores()
    const { loadPasswordsHealth } = useTool()

    // -------------------- EFFECT ----------------------

    useEffect(() => {
      if (!(cipherStore.isSynching || cipherStore.isBatchDecrypting)) {
        toolStore.setDataLoading(false)
      }
    }, [cipherStore.isSynching, cipherStore.isBatchDecrypting, toolStore])

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
            titleTx="pass_health:title"
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
            title="pass_health:weak_passwords.name"
            desc="pass_health:weak_passwords.desc"
            isLoading={toolStore.isLoadingHealth}
            warningCount={toolStore.weakPasswords.length}
            action={() => navigation.navigate("weakPasswordList")}
            bordered
          />
          <Options
            bordered
            title="pass_health:reused_passwords.name"
            desc="pass_health:reused_passwords.desc"
            isLoading={toolStore.isLoadingHealth}
            warningCount={toolStore.reusedPasswords.length}
            action={() => navigation.navigate("reusePasswordList")}
          />
          <Options
            title="pass_health:exposed_passwords.name"
            desc="pass_health:exposed_passwords.desc"
            warningCount={0}
            leftIcon={"data-breach-scanner"}
            action={() => navigation.navigate("exposedPasswordList")}
          />
        </View>
      </Screen>
    )
  }
)

type OptionsProps = {
  title: TxKeyPath
  desc: TxKeyPath
  isLoading?: boolean
  warningCount: number
  leftIcon?: ImageIconTypes
  action: () => void
  bordered?: boolean
}
// Render an option
const Options = ({
  title,
  desc,
  warningCount,
  isLoading,
  leftIcon,
  action,
  bordered,
}: OptionsProps) => {
  const {
    theme: { colors },
  } = useAppTheme()
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
          <View style={styles.mt4}>
            {!leftIcon && <WarningCounter isLoading={isLoading} count={warningCount} />}
            {!!leftIcon && <ImageIcon icon={leftIcon} size={40} />}
          </View>

          <View style={styles.optionText}>
            <Text tx={title} />
            <Text preset="label" tx={desc} size="sm" style={styles.mt4} />
          </View>
        </View>

        <Icon icon="caret-right" size={20} color={colors.label} style={styles.mt4} />
      </View>
    </PressableScale>
  )
}

// Render warning counter
const WarningCounter = ({ count, isLoading }: { count: number; isLoading?: boolean }) => {
  const {
    theme: { colors },
  } = useAppTheme()
  return (
    <View
      style={[
        styles.warningCounter,
        {
          backgroundColor: isLoading ? colors.disable : count > 0 ? colors.error : colors.primary,
        },
      ]}
    >
      {isLoading && <ActivityIndicator size="small" color={colors.white} />}
      {!isLoading && <Text preset="bold" text={count.toString()} color={colors.white} />}
    </View>
  )
}

const styles = StyleSheet.create({
  mt4: {
    marginTop: 4,
  },
  optionContent: {
    flexDirection: "row",
    flexGrow: 1,
    flexShrink: 1,
  },
  optionText: {
    flex: 1,
    paddingHorizontal: 10,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  warningCounter: {
    alignItems: "center",
    borderRadius: 8,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
})
