import { memo } from "react"
import { NativeModules, StyleSheet, View } from "react-native"
import { Icon, PressableIcon, PressableScale, Text } from "app/components/cores"
import { getTOTP, parseOTPUri } from "app/utils/totp"
import { CipherIconImage } from "app/components/ciphers/cipherList/CipherIconImage"
import { CipherAppView } from "@/static/types"
import { useClipboard } from "@/services/utils"
import { getCipherDescription } from "@/utils/cipherHelper"
import { CipherType } from "core/enums"

const { RNAutofillServiceAndroid } = NativeModules

type Prop = {
  item: CipherAppView
  openActionMenu: (val: CipherAppView) => void
}

export const AutofillListItem = memo(({ item, openActionMenu }: Prop) => {
  const { copyToClipboard } = useClipboard()

  const selectForAutoFill = (item: CipherAppView) => {
    RNAutofillServiceAndroid.addAutofillValue(
      item.id,
      item.login.username,
      item.login.password,
      item.name,
      item.login.uri
    )
  }

  const cipherDescription = getCipherDescription(item)

  return (
    <PressableScale
      onPress={() => {
        selectForAutoFill(item)
        if (item.login.hasTotp) {
          const otp = getTOTP(parseOTPUri(item.login.totp))
          copyToClipboard(otp)
        }
      }}
      style={styles.container}
    >
      <View style={styles.row}>
        <CipherIconImage
          isHaveKey={item.login.hasFido2Credentials}
          resizeMode="contain"
          source={item.imgLogo}
          cipherType={CipherType.Login}
        />

        <View style={styles.content}>
          <Text preset="bold" numberOfLines={1} text={item.name} />

          {!!cipherDescription && (
            <Text preset="label" size="sm" text={cipherDescription} numberOfLines={1} />
          )}
        </View>
        {item.organizationId && <Icon icon="users-three" size={22} containerStyle={styles.ml10} />}

        <PressableIcon
          icon="dots-three"
          size={22}
          onPress={() => openActionMenu(item)}
          containerStyle={styles.ml10}
        />
      </View>
    </PressableScale>
  )
})

AutofillListItem.displayName = "AutofillListItem"

const styles = StyleSheet.create({
  container: {
    height: 71,
    paddingVertical: 12,
  },
  content: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  ml10: {
    marginLeft: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
