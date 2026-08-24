import { FC, useCallback } from "react"
import { StyleSheet, View } from "react-native"
import { observer } from "mobx-react-lite"

import { CiphelBaseInfo, CipherIconImage } from "app/components/ciphers"
import { Text, Screen, Header, Icon, PressableIcon } from "app/components/cores"
import { useStores } from "app/models"
import { BrowseScreenProps } from "app/navigators"
import { CipherActionsModal } from "app/static/types"
import { CipherType } from "core/enums"

import { getCipherActionPermissions } from "@/utils/cipherActionPermissions"
import { useAppTheme } from "@/utils/useAppTheme"

import { CardInfo } from "./CardInfo"
import { CryptoWalletInfo } from "./cryptoInfo"
import { IdentityInfo } from "./IdentityInfo"
import { NoteInfo } from "./NoteInfo"
import { PasswordInfo } from "./PasswordInfo"

export const CipherDetailScreen: FC<BrowseScreenProps<"cipherDetail">> = observer(
  ({
    navigation,
    route: {
      params: { cipher, quickShare },
    },
  }) => {
    const { cipherStore } = useStores()
    const {
      theme: { colors },
    } = useAppTheme()

    // ------------------ COMPUTED --------------------

    const { canEdit, canStandardAttachment, canSharedAttachment, canDelete, editable, isShared } =
      getCipherActionPermissions({ item: cipher, organizations: cipherStore.organizations })
    const lockerMasterPassword = cipher.type === CipherType.MasterPassword
    const notSync = [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
      cipher.id
    )
    const showActions = !lockerMasterPassword && !quickShare
    const canAttach = canStandardAttachment || canSharedAttachment
    const attachmentIsShared = isShared && !editable

    // ------------------ METHODs --------------------
    const navigateToEdit = useCallback(() => {
      navigation.replace("cipherEdit", {
        mode: "edit",
        cipherType: cipher.type,
        cipher,
      })
    }, [cipher, navigation])

    const navigateToAttachment = useCallback(() => {
      navigation.navigate("attachment", {
        cipher,
        isShared: attachmentIsShared,
      })
    }, [attachmentIsShared, cipher, navigation])

    const navigateToDelete = useCallback(() => {
      const browseState = navigation.getState()
      navigation.navigate("cipherActionsModal", {
        mode: CipherActionsModal.DELETE,
        deleteIds: [cipher.id],
        deleteReturnContext: {
          browseNavigatorKey: browseState.key,
          removeBrowseStack: browseState.index === 0,
        },
      })
    }, [cipher.id, navigation])

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
        header={<Header leftIcon="arrow-left" onLeftPress={navigation.goBack} />}
        contentContainerStyle={styles.container}
      >
        <CipherIconImage
          resizeMode="contain"
          isHaveKey={cipher.login.hasFido2Credentials}
          cipherType={cipher.type}
          source={cipher.imgLogo}
          style={styles.logo}
        />

        {showActions && (canEdit || canAttach || canDelete) && (
          <View style={styles.actions}>
            {canEdit && <PressableIcon icon="edit" onPress={navigateToEdit} />}
            {canAttach && <PressableIcon icon="file-arrow-up" onPress={navigateToAttachment} />}
            {canDelete && (
              <PressableIcon icon="trash" color={colors.error} onPress={navigateToDelete} />
            )}
          </View>
        )}

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
  actions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
    marginTop: 16,
  },
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
