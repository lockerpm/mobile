import { FC, useCallback } from "react"
import { observer } from "mobx-react-lite"
import { StyleSheet, View } from "react-native"
import { Text, Screen, Header, Icon } from "app/components/cores"
import { useStores } from "app/models"
import { CipherType } from "core/enums"

import { BrowseScreenProps } from "app/navigators"
import { CiphelBaseInfo, CipherIconImage } from "app/components/ciphers"
import { CipherActionsModal, CipherAppView } from "app/static/types"
import { PasswordInfo } from "./PasswordInfo"
import { CardInfo } from "./CardInfo"
import { IdentityInfo } from "./IdentityInfo"
import { NoteInfo } from "./NoteInfo"
import { CryptoWalletInfo } from "./cryptoInfo"

export const CipherDetailScreen: FC<BrowseScreenProps<"cipherDetail">> = observer(
  ({
    navigation,
    route: {
      params: { cipher, quickShare },
    },
  }) => {
    const { cipherStore } = useStores()

    // ------------------ COMPUTED --------------------

    const lockerMasterPassword = cipher?.type === CipherType.MasterPassword
    const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
      cipher.id
    )

    // ------------------ METHODs --------------------
    const navigateToCipherActions = useCallback(() => {
      const data: CipherAppView = {
        ...cipher,
        revisionDate: null,
      }
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DEFAULT,
        item: data,
        deleteIds: [cipher.id],
      })
    }, [cipher])

    // ------------------ RENDER --------------------

    const CipherInfo = useCallback(() => {
      switch (cipher.type) {
        case CipherType.MasterPassword:
        case CipherType.Login:
          return <PasswordInfo item={cipher} />
        case CipherType.Card:
          return <CardInfo item={cipher} />
        case CipherType.Identity:
          return <IdentityInfo item={cipher} />
        case CipherType.SecureNote:
          return <NoteInfo item={cipher} />
        case CipherType.CryptoWallet:
          return <CryptoWalletInfo item={cipher} />

        case CipherType.TOTP:
          return null
      }
    }, [cipher])

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            rightIcon={!lockerMasterPassword && !quickShare ? "dots-three" : undefined}
            onRightPress={navigateToCipherActions}
          />
        }
        contentContainerStyle={styles.container}
      >
        <CipherIconImage
          resizeMode="contain"
          isHaveKey={cipher.login.hasFido2Credentials}
          cipherType={cipher.type}
          source={cipher.imgLogo}
          style={styles.logo}
        />

        <View style={styles.title}>
          <Text preset="bold" size="xxl" text={cipher.name} style={styles.name} />

          {notSync && <Icon icon="wifi-slash" size={22} containerStyle={styles.ml10} />}
        </View>

        <CipherInfo />

        {!lockerMasterPassword && <CiphelBaseInfo cipher={cipher} />}
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  logo: {
    alignSelf: "center",
    borderRadius: 8,
    height: 55,
    width: 55,
  },
  ml10: {
    marginLeft: 10,
  },
  name: {
    textAlign: "center",
  },
  title: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    margin: 12,
  },
})
