import { memo } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"

import { CipherIconImage } from "app/components/ciphers"
import { PressableScale, Text } from "app/components/cores"
import { AccountRole, SharedWithYouType } from "app/static/types"

import { useAppLocale } from "@/i18n"
import { ThemedStyle } from "@/theme"
import { useAppTheme } from "@/utils/useAppTheme"

type Prop = {
  item: SharedWithYouType
  openActionMenu?: (item: SharedWithYouType, acceptedTime?: number) => void
  org?: {
    type: AccountRole
    name: string
  }
  acceptedTime?: number
}

export const ShareWithYouItem = memo((props: Prop) => {
  const { item, openActionMenu, org, acceptedTime } = props
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { translate } = useAppLocale()

  const getDescription = (item: SharedWithYouType) => {
    if (item.isShared) {
      return item.description
    }

    let shareType = ""
    if (org) {
      switch (org.type) {
        case AccountRole.MEMBER:
          shareType = translate("shares:share_type.view")
          break
        case AccountRole.ADMIN:
          shareType = translate("shares:share_type.edit")
          break
      }
    }
    return org ? `${translate("common:from")} ${org.name} - ${shareType}` : ""
  }

  const description = getDescription(item)
  const name = item.name || translate("common:wrong_key")

  return (
    <PressableScale
      disabled={!openActionMenu || item.isAccepted || !item.name}
      onPress={() => {
        if (openActionMenu) {
          openActionMenu(item, acceptedTime)
        }
      }}
      style={styles.container}
    >
      <View style={styles.row}>
        <CipherIconImage
          isHaveKey={item.login.hasFido2Credentials}
          cipherType={item.type}
          source={item.imgLogo}
        />

        <View style={styles.content}>
          <View style={styles.row}>
            <View style={styles.name}>
              <Text preset="bold" text={name} numberOfLines={1} />
            </View>

            {/* Pending status */}
            {(item.isShared || item.isAccepted) && (
              <View style={themed($pending)}>
                <Text
                  tx={item.isAccepted ? "shares:wait_confirm" : "common:pending"}
                  preset="bold"
                  size="xs"
                  color={colors.background}
                />
              </View>
            )}
          </View>

          {/* Description */}
          {!!description && (
            <Text
              size="sm"
              preset="label"
              text={description}
              style={styles.mt3}
              numberOfLines={1}
            />
          )}
        </View>
      </View>
    </PressableScale>
  )
})

ShareWithYouItem.displayName = "ShareWithYouItem"

const $pending: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 10,
  paddingVertical: 2,
  backgroundColor: colors.warning,
  borderRadius: 3,
})

const styles = StyleSheet.create({
  container: {
    height: 71,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  mt3: {
    marginTop: 3,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    marginRight: 12,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
