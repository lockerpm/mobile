import { View, StyleSheet, Dimensions, ViewStyle } from "react-native"
import {
  Checkbox,
  Icon,
  PressableIcon,
  PressableScale,
  Text,
  TextInput,
} from "app/components/cores"
import { TxKeyPath } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ExpireSelect } from "./ExpireSelect"
import { AccessSelect } from "./AccessSelect"
import { ThemedStyle } from "@/theme"

const width = Dimensions.get("window").width

interface QuickShareOptionProps {
  isAnyone: boolean
  isSelect: boolean
  action: () => void
  tx: TxKeyPath
  iconColor: string
}

const QuickShareOption = ({ isAnyone, isSelect, action, tx, iconColor }: QuickShareOptionProps) => {
  return (
    <PressableScale style={styles.optionContainer} onPress={action}>
      <Checkbox value={isSelect} onPress={action} />
      <Icon
        icon={isAnyone ? "users-three" : "user"}
        size={24}
        color={iconColor}
        style={styles.checkbox}
      />
      <Text tx={tx} />
    </PressableScale>
  )
}

interface QuickShareConfigProps {
  requireOtp: boolean
  setRequireOtp: (val: boolean) => void
  email: string
  setEmail: (val: string) => void
  addEmail: () => void
  emails: string[]
  countAccess: boolean
  setCountAccess: (val: boolean) => void
  removeEmail: (val: string) => void
  expireAfter: number | null
  maxAccessCount: string
  setMaxAccessCount: (val: string) => void
  setExpireAfter: (val: number | null) => void
}

export const QuickShareConfig = ({
  requireOtp,
  setRequireOtp,
  email,
  setEmail,
  addEmail,
  emails,
  countAccess,
  setCountAccess,
  removeEmail,
  expireAfter,
  maxAccessCount,
  setMaxAccessCount,
  setExpireAfter,
}: QuickShareConfigProps) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View
      style={{
        width: width - 32,
      }}
    >
      <Text preset="bold" tx="quick_shares:config.title" style={styles.title} />

      <QuickShareOption
        isAnyone
        isSelect={!requireOtp}
        action={() => {
          setRequireOtp(false)
        }}
        tx="quick_shares:config.anyone"
        iconColor={colors.title}
      />
      <QuickShareOption
        isAnyone={false}
        isSelect={requireOtp}
        action={() => {
          setRequireOtp(true)
        }}
        tx="quick_shares:config.invited"
        iconColor={colors.title}
      />

      {requireOtp && (
        <View style={styles.mt16}>
          <Text preset="bold" tx="quick_shares:config.email" style={styles.mb12} />
          <View style={styles.row}>
            <View style={styles.width80}>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="done"
                placeholderTx="shares:share_folder.add_email"
                selectionColor={colors.primary}
                onChangeText={setEmail}
                value={email}
                clearButtonMode="unless-editing"
                onSubmitEditing={addEmail}
              />
            </View>
            <PressableIcon
              icon="user-plus"
              size={24}
              color={colors.white}
              onPress={addEmail}
              containerStyle={[themed($inputAdd), !email && styles.disableAdd]}
            />
          </View>
          <Text tx="quick_shares:config.verify" style={styles.verify} />
        </View>
      )}

      {requireOtp &&
        emails.map((e, index) => {
          return (
            <View key={index} style={styles.requireOtp}>
              <Text text={e} />
              <PressableIcon icon="trash" onPress={() => removeEmail(e)} color={colors.error} />
            </View>
          )
        })}

      <Text preset="bold" tx="quick_shares:config.expired.tl" style={styles.mv12} />

      <ExpireSelect setExpireAfter={setExpireAfter} expireAfter={expireAfter} />

      <Text tx="quick_shares:config.or" style={styles.mv12} />

      <AccessSelect
        setCountAccess={setCountAccess}
        countAccess={countAccess}
        maxAccessCount={maxAccessCount}
        setMaxAccessCount={setMaxAccessCount}
      />
    </View>
  )
}
const $inputAdd: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.primary,
  borderRadius: 12,
  padding: 12,
  marginLeft: 12,
  height: 50,
  justifyContent: "center",
  alignItems: "center",
})

const styles = StyleSheet.create({
  checkbox: {
    marginHorizontal: 12,
  },
  disableAdd: {
    opacity: 0.5,
  },
  mb12: {
    marginBottom: 12,
  },
  mt16: {
    marginTop: 16,
  },
  mv12: {
    marginVertical: 12,
  },
  optionContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 5,
    paddingVertical: 5,
  },
  requireOtp: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  title: {
    marginBottom: 4,
    marginTop: 24,
  },
  verify: {
    marginBottom: 12,
    marginTop: 12,
  },
  width80: {
    flexGrow: 1,
    flexShrink: 1,
  },
})
