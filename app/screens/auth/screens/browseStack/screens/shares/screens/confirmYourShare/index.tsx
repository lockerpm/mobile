import { FC, useState } from "react"
import { StyleSheet, View, ViewStyle } from "react-native"
import { observer } from "mobx-react-lite"

import { Text, Button, Screen, Header } from "app/components/cores"
import { useStores } from "app/models"
import { ShareScreenProps } from "app/navigators"
import { useCipherData } from "app/services/hook"
import { debounce } from "app/utils/utils"

import { ThemedStyle } from "@/theme"
import { delay } from "@/utils/delay"
import { useAppTheme } from "@/utils/useAppTheme"

import { YourShareCipherItemInfo } from "./YourShareCipherItemInfo"
import { YourShareCollectionItemInfo } from "./YourShareCollectionItemInfo"

export const ConfirmYourShareScreen: FC<ShareScreenProps<"confirmYourShare">> = observer(
  ({
    navigation,
    route: {
      params: { organizationId, members, item },
    },
  }) => {
    const { cipherStore } = useStores()
    const { themed } = useAppTheme()
    const { confirmShareCipher } = useCipherData()

    // --------------- PARAMS ----------------

    const [isLoading, setIsLoading] = useState(false)

    // --------------- COMPUTED ----------------

    // --------------- METHODS ----------------
    const onClose = debounce(() => {
      navigation.replace("yourShareCipherList")
    }, 400)

    const handleConfirmShare = async () => {
      setIsLoading(true)
      await Promise.all(
        members.map(async (member) => {
          const publicKeyRes = await cipherStore.getSharingPublicKey(member.email)
          if (publicKeyRes.kind === "ok") {
            await confirmShareCipher(organizationId, member.id, publicKeyRes.data.public_key)
          }
        })
      )

      await delay(1000)
      setIsLoading(false)
      onClose()
    }

    // --------------- EFFECT ----------------

    // --------------- RENDER ----------------

    return (
      <Screen
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="shares:confirm_share.title"
          />
        }
        footer={
          <Button
            tx="common:confirm"
            disabled={isLoading}
            loading={isLoading}
            onPress={handleConfirmShare}
            style={styles.mh20}
          />
        }
        contentContainerStyle={styles.flex}
      >
        <View style={themed($itemInfo)}>
          {item.type === "cipher" && (
            <YourShareCipherItemInfo
              hasFido2Credentials={item.hasFido2Credentials}
              cipherType={item.cipherType}
              imgLogo={item.imgLogo}
              name={item.name}
              description={item.description}
            />
          )}
          {item.type === "folder" && (
            <YourShareCollectionItemInfo name={item.name} cipherCount={item.cipherCount} />
          )}
        </View>

        <Text preset="bold" tx="shares:confirm_share.list" />
        <View style={themed($fingerprint)}>
          {members.map((member) => (
            <Text key={member.email} text={member.email} />
          ))}
        </View>
        <Text preset="label" tx="shares:confirm_share.des" style={styles.mb24} />
      </Screen>
    )
  }
)

const $fingerprint: ThemedStyle<ViewStyle> = ({ colors }) => ({
  paddingHorizontal: 15,
  paddingVertical: 10,
  borderRadius: 5,
  backgroundColor: colors.border,
  marginVertical: 16,
})

const $itemInfo: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 12,
  marginBottom: 24,
})

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mb24: {
    marginBottom: 25,
  },
  mh20: {
    marginBottom: 24,
    marginHorizontal: 20,
  },
})
