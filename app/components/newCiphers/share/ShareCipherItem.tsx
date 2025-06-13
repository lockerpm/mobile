import React, { memo } from "react"
import { TouchableOpacity, View } from "react-native"
import { Icon, Text } from "app/components/cores"
import { CipherShareType, SharingStatus } from "app/static/types"
import { useAppLocale, useTheme } from "app/services/context"
import { CipherIconImage } from "../cipherList"

type Prop = {
  item: CipherShareType
  openAction: (val: any) => void
  openConfirmModal: (val: any) => void
}

export const ShareCipherItem = memo((props: Prop) => {
  const { item, openAction, openConfirmModal } = props
  const { colors } = useTheme()
  const { translate } = useAppLocale()

  return (
    <View>
      <TouchableOpacity
        onPress={() => {
          openAction(item)
        }}
        style={{
          paddingVertical: 12,
          height: 70.5,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Cipher avatar */}
          <CipherIconImage cipherType={item.type} source={item.imgLogo} />

          <View style={{ flex: 1, marginLeft: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={{ flex: 1 }}>
                <Text
                  preset="bold"
                  text={item.name}
                  numberOfLines={1}
                  style={{
                    marginRight: item.status ? 10 : 0,
                  }}
                />
              </View>

              {/* Sharing status */}
              {item.status && (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {item.status === SharingStatus.ACCEPTED && (
                    <View
                      style={{
                        marginRight: 4,
                        borderRadius: 15,
                        width: 20,
                        height: 20,
                        backgroundColor: colors.error,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text text="1" size="small" color={colors.white} preset="bold" />
                    </View>
                  )}
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 2,
                      backgroundColor:
                        item.status === SharingStatus.INVITED
                          ? colors.warning
                          : item.status === SharingStatus.ACCEPTED
                          ? colors.title
                          : colors.primary,
                      borderRadius: 3,
                    }}
                  >
                    <Text
                      size="small"
                      text={
                        item.status === SharingStatus.ACCEPTED
                          ? translate("shares.wait_confirm")
                          : // @ts-ignore
                            translate(`shares.status.${item.status.toLowerCase()}`)
                      }
                      style={{
                        fontWeight: "bold",
                        color: colors.background,
                      }}
                    />
                  </View>
                </View>
              )}

              {item.notSync && (
                <View style={{ marginLeft: 10 }}>
                  <Icon icon="wifi-slash" size={22} />
                </View>
              )}
            </View>

            {!!item.description && (
              <Text preset="label" size="base" text={item.description} numberOfLines={1} />
            )}
          </View>
        </View>
      </TouchableOpacity>

      {item?.status === SharingStatus.ACCEPTED && (
        <View
          style={{
            flexDirection: "row",
            marginVertical: 8,
          }}
        >
          <Text
            text={translate("shares.confirm")}
            style={{
              flex: 2,
              fontSize: 14,
            }}
          />
          <View>
            <TouchableOpacity
              onPress={() => {
                openConfirmModal(item)
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 8,
                borderColor: colors.primary,
                borderWidth: 1,
                padding: 8,
                paddingHorizontal: 16,
              }}
            >
              <Icon icon="check" color={colors.primary} size={24} />
              <Text
                text={translate("common.confirm")}
                style={{
                  marginLeft: 8,
                  color: colors.primary,
                  fontSize: 14,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  )
})
