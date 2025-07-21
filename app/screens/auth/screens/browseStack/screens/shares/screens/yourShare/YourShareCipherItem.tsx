import { memo } from "react"
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { Icon, Text } from "app/components/cores"
import { CipherShareType, SharingStatus } from "app/static/types"
import { useAppLocale } from "@/i18n"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { CipherIconImage } from "@/components/ciphers"

type Prop = {
  item: CipherShareType
  openAction: (item: CipherShareType) => void
  openConfirmModal: (item: CipherShareType) => void
}

export const YourShareCipherItem = memo((props: Prop) => {
  const { item, openAction, openConfirmModal } = props
  const { translate } = useAppLocale()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          openAction(item)
        }}
        style={styles.container}
      >
        <View style={styles.content}>
          <CipherIconImage cipherType={item.type} source={item.imgLogo} />

          <View style={styles.content2}>
            <View style={styles.row}>
              <Text preset="bold" text={item.name} numberOfLines={1} style={styles.name} />

              {/* Sharing status */}
              {item.status && (
                <View style={styles.status}>
                  {item.status === SharingStatus.ACCEPTED && (
                    <View style={themed($accepted)}>
                      <Text text="1" size="xs" color={colors.white} preset="bold" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.status2,
                      {
                        backgroundColor:
                          item.status === SharingStatus.INVITED
                            ? colors.warning
                            : item.status === SharingStatus.ACCEPTED
                              ? colors.title
                              : colors.primary,
                      },
                    ]}
                  >
                    <Text
                      size="xs"
                      text={
                        item.status === SharingStatus.ACCEPTED
                          ? translate("shares:wait_confirm")
                          : // @ts-ignore
                            translate(`shares:status.${item.status.toLowerCase()}`)
                      }
                      weight="bold"
                      color={colors.background}
                    />
                  </View>
                </View>
              )}
            </View>

            {!!item.description && (
              <Text preset="label" size="xs" text={item.description} numberOfLines={2} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {item?.status === SharingStatus.ACCEPTED && (
        <View style={styles.acceptContainer}>
          <Text tx={"shares:confirm"} size="xs" style={styles.name} />
          <View>
            <TouchableOpacity
              onPress={() => {
                openConfirmModal(item)
              }}
              style={themed($confirm)}
            >
              <Icon icon="check" color={colors.primary} size={20} />
              <Text tx={"common:confirm"} color={colors.primary} size="xs" style={styles.ml8} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
})

YourShareCipherItem.displayName = "YourShareCipherItem"

const $accepted: ThemedStyle<ViewStyle> = ({ colors }) => ({
  marginRight: 4,
  borderRadius: 15,
  width: 20,
  height: 20,
  backgroundColor: colors.error,
  justifyContent: "center",
  alignItems: "center",
})

const $confirm: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  borderRadius: 8,
  borderColor: colors.primary,
  borderWidth: 1,
  padding: 8,
  paddingHorizontal: 12,
  marginLeft: 8,
})

const styles = StyleSheet.create({
  acceptContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  container: {
    minHeight: 71,
    paddingVertical: 12,
  },
  content: {
    alignItems: "center",
    flexDirection: "row",
  },
  content2: {
    flex: 1,
    marginLeft: 12,
  },
  flex: {
    flex: 1,
  },
  ml8: {
    marginLeft: 8,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
  },
  notSync: {
    marginLeft: 10,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
  status: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status2: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    marginLeft: 10,
    paddingHorizontal: 10,
  },
})
