import moment from "moment"
import { FC } from "react"
import { View, ViewStyle, StyleSheet } from "react-native"
import { Button, Header, Icon, PressableScale, Screen, Text } from "app/components/cores"
import { CipherIconImage } from "app/components/ciphers"
import { ShareScreenProps } from "@/navigators"
import { useAppTheme } from "@/utils/useAppTheme"
import { useClipboard } from "@/services/utils"
import { getCipherDescription, getCipherLogo } from "@/utils/cipherHelper"
import { ThemedStyle } from "@/theme"
import { getPublicShareUrl } from "@/utils/quickShare"

export const QuickShareDetailScreen: FC<ShareScreenProps<"quickShareCipherDetail">> = ({
  navigation,
  route,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { copyToClipboard } = useClipboard()

  const send = route.params.send

  const cipherIcon = getCipherLogo(send.cipher)
  const cipherDescription = getCipherDescription(send.cipher)

  const navigateToCipherInfo = () => {
    navigation.navigate("cipherDetail", {
      cipher: {
        ...send.cipher,
        imgLogo: cipherIcon,
        revisionDate: null,
        notSync: false,
        isDeleted: send.cipher.isDeleted,
      },
      quickShare: true,
    })
  }

  return (
    <Screen
      safeAreaEdges={["bottom"]}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={navigation.goBack}
          titleTx={"quick_shares:detail.tl"}
        />
      }
      footer={
        <View style={styles.ph16}>
          <Button
            tx="quick_shares:action.copy"
            onPress={() => {
              const url = getPublicShareUrl(send.accessId, send.key)
              copyToClipboard(url)
            }}
          />
        </View>
      }
      contentContainerStyle={styles.ph16}
    >
      <PressableScale style={themed($header)} onPress={navigateToCipherInfo}>
        <View style={styles.row}>
          <CipherIconImage source={cipherIcon} style={styles.logo} cipherType={send.cipher.type} />
          <View style={styles.ml12}>
            <Text preset="bold" text={send.cipher.name} numberOfLines={2} />
            {!!cipherDescription && <Text size="sm" preset="label" text={cipherDescription} />}
          </View>
        </View>

        <Icon
          icon="caret-left"
          color={colors.title}
          size={24}
          containerStyle={{
            transform: [
              {
                scaleX: -1,
              },
            ],
          }}
        />
      </PressableScale>
      {!!send.creationDate && (
        <View style={themed($horizontalStyle)}>
          <Text preset="label" tx="quick_shares:detail.share_time" />
          <Text text={moment.unix(send.creationDate.getTime() / 1000).fromNow()} />
        </View>
      )}

      <View style={themed($horizontalStyle)}>
        <Text tx="quick_shares:detail.share_with" />
        <View>
          {send.emails?.map((e) => <Text key={e} text={e} />)}
          {!send.emails || (send.emails.length === 0 && <Text tx="quick_shares:detail.anyone" />)}
        </View>
      </View>

      {!!send.accessCount && (
        <View style={themed($horizontalStyle)}>
          <Text preset="label" tx="quick_shares:detail.View" />
          <Text text={`${send.accessCount}`} />
        </View>
      )}

      {!!send.expirationDate && (
        <View style={themed($horizontalStyle)}>
          <Text preset="label" tx="quick_shares:detail.expire" />
          <Text
            text={moment
              .unix(send.expirationDate.getTime() / 1000)
              .format("Do MMM YYYY, h:mm:ss A")}
          />
        </View>
      )}
    </Screen>
  )
}

const $horizontalStyle: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $header: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.block,
  paddingVertical: 16,
  paddingHorizontal: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const styles = StyleSheet.create({
  logo: {
    borderRadius: 8,
    height: 40,
    width: 40,
  },
  ml12: {
    marginLeft: 12,
  },
  ph16: {
    paddingHorizontal: 16,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
  },
})
