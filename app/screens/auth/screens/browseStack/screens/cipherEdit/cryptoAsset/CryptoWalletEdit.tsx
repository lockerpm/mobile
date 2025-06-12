import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Image, TouchableOpacity, StyleSheet } from "react-native"
import find from "lodash/find"
import { ChainSelect } from "./ChainSelect"
import { AppSelect } from "./AppSelect"
import { useStores } from "app/models"
import { useAppLocale, useTheme } from "app/services/context"
import { useCipherData, useCipherHelper, useFolder } from "app/services/hook"
import { CipherView, FieldView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { CryptoWalletData, toCryptoWalletData } from "app/utils/crypto"
import { CipherType } from "core/enums"
import { Button, Header, Screen, TextInput, Text, Icon } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { BrowseStackScreenProps } from "app/navigators"
import { CipherAppView, CipherEditMode } from "app/static/types"
import { CipherOthersInfo, CustomFieldsEdit, SeedPhraseInput } from "app/components/newCiphers"
import { FolderView } from "core/models/view/folderView"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseStackScreenProps<"cipherEdit">["navigation"]

  // other common info
  folder?: FolderView
  collection?: CollectionView
  collectionIds: string[]
  organizationId: string

  isOwner: boolean
}

export const CryptoWalletEdit = observer(
  ({
    navigation,
    mode,
    item,
    collection,
    folder,
    organizationId,
    collectionIds,
    isOwner,
  }: Props) => {
    const { collectionStore } = useStores()
    const { translate } = useAppLocale()
    const { colors } = useTheme()
    const { shareFolderAddItem } = useFolder()
    const { newCipher, getPasswordStrength } = useCipherHelper()
    const { createCipher, updateCipher } = useCipherData()

    const selectedCipher: CipherAppView = item
    const cryptoWalletData = toCryptoWalletData(selectedCipher.notes)

    // ------------------------- PARAMS ------------------------------------

    const [name, setName] = useState(mode !== "add" ? selectedCipher.name : "")

    const [walletApp, setWalletApp] = useState(
      mode !== "add" ? cryptoWalletData.walletApp : { alias: null, name: null },
    )
    const [username, setUsername] = useState(mode !== "add" ? cryptoWalletData.username : "")
    const [password, setPassword] = useState(mode !== "add" ? cryptoWalletData.password : "")
    const [pin, setPin] = useState(mode !== "add" ? cryptoWalletData.pin || "" : "")
    const [address, setAddress] = useState(mode !== "add" ? cryptoWalletData.address : "")
    const [privateKey, setPrivateKey] = useState(mode !== "add" ? cryptoWalletData.privateKey : "")
    const [seed, setSeed] = useState(mode !== "add" ? cryptoWalletData.seed : "           ")
    const [networks, setNetworks] = useState<{ alias: string; name: string }[]>(
      mode !== "add" ? cryptoWalletData.networks || [] : [],
    )

    // other
    const [fields, setFields] = useState<FieldView[]>(item.fields)
    const [note, setNote] = useState("") // custom note for the cipher, not use in CipherType SecureNote

    const [isLoading, setIsLoading] = useState(false)
    // -------------------------- COMPUTED ------------------------------

    // -------------------------- METHODS ------------------------------

    const handleSave = async () => {
      setIsLoading(true)
      let payload: CipherView
      if (mode === "add") {
        payload = newCipher(CipherType.CryptoWallet)
      } else {
        // @ts-ignore
        payload = { ...selectedCipher }
      }

      const cryptoData: CryptoWalletData = {
        seed,
        notes: note,
        password,
        address,
        pin,
        walletApp,
        username,
        privateKey,
        networks,
      }

      payload.fields = fields
      payload.name = name
      payload.notes = JSON.stringify(cryptoData)
      payload.folderId = folder?.id || ""
      payload.organizationId = organizationId
      payload.secureNote = {
        // @ts-ignore
        response: null,
        type: 0,
      }

      let res = { kind: "unknown" }
      if (["add", "clone"].includes(mode)) {
        res = await createCipher(payload, 0, collectionIds)
      } else {
        res = await updateCipher(payload.id, payload, 0, collectionIds)
      }
      if (res.kind === "ok") {
        if (isOwner) {
          if (collection) {
            const collectionView =
              find(collectionStore.collections, (e) => e.id === collection) || {}
            await shareFolderAddItem(collectionView, payload)
          }
        }
        setIsLoading(false)
        navigation.goBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === "5002") {
          // setIsOpenModal(true)
        }
      }
    }

    // -------------------------- RENDER ------------------------------

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            title={
              mode === "add"
                ? `${translate("common.add")} ${translate("common.crypto_wallet")}`
                : translate("common.edit")
            }
            onLeftPress={() => navigation.goBack()}
            leftText={translate("common.cancel")}
            RightActionComponent={
              <Button
                loading={isLoading}
                preset="teriatary"
                disabled={isLoading || !name.trim()}
                text={translate("common.save")}
                onPress={handleSave}
              />
            }
          />
        }
        ScrollViewProps={{
          contentContainerStyle: styles.scrollContainer,
        }}
      >
        <View style={{ padding: 16, paddingTop: 0 }}>
          <View style={{ flexDirection: "row" }}>
            <Image
              resizeMode="contain"
              source={BROWSE_ITEMS.cryptoWallet.icon}
              style={{
                height: 50,
                width: 50,
                marginRight: 10,
                marginTop: 25,
              }}
            />
            <View style={{ flex: 1 }}>
              <TextInput
                animated
                isRequired
                label={translate("common.item_name")}
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>
        </View>

        <View style={{ padding: 16, backgroundColor: colors.block }}>
          <Text preset="label" size="base" text={translate("common.details").toUpperCase()} />
        </View>

        {/* Info */}
        <View
          style={{
            padding: 16,
            paddingBottom: 32,
          }}
        >
          <AppSelect
            alias={walletApp.alias}
            onChange={(alias: string, appName: string) => {
              setWalletApp({ alias, name: appName })
            }}
          />

          <TextInput
            animated
            label={translate("common.username")}
            value={username}
            onChangeText={setUsername}
          />

          {/* Password */}
          <TextInput
            isPassword
            animated
            label={translate("common.password")}
            value={password}
            onChangeText={setPassword}
          />
          {!!password && (
            <PasswordStrength
              value={getPasswordStrength(password).score}
              style={{ marginTop: 8 }}
            />
          )}

          <TouchableOpacity
            onPress={() => {
              // navigation.navigate("passwordGenerator")
            }}
            style={{
              marginTop: 16,
            }}
          >
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon icon="repeat" size={20} color={colors.primary} />
                <Text
                  color={colors.primary}
                  size="base"
                  text={translate("common.generate")}
                  style={{ marginLeft: 7 }}
                />
              </View>
              <Icon icon="caret-right" size={20} color={colors.title} />
            </View>
          </TouchableOpacity>

          <TextInput animated isPassword label={"PIN"} value={pin} onChangeText={setPin} />

          <TextInput
            animated
            label={translate("crypto_asset.wallet_address")}
            value={address}
            onChangeText={setAddress}
          />

          <TextInput
            isPassword
            animated
            label={translate("crypto_asset.private_key")}
            value={privateKey}
            onChangeText={setPrivateKey}
          />

          {/* Seed */}
          <View style={{ flex: 1, marginTop: 20 }}>
            <Text preset="label" size="base" text={translate("crypto_asset.seed")} />
            <SeedPhraseInput seed={seed} setSeed={setSeed} />
          </View>

          <View style={{ flex: 1, marginTop: 20 }}>
            <ChainSelect selected={networks} onChange={setNetworks} />
          </View>
        </View>

        <CustomFieldsEdit fields={fields} setFields={setFields} />

        <CipherOthersInfo
          isOwner={isOwner}
          hasNote={true}
          note={note}
          onChangeNote={setNote}
          folder={folder}
          collection={collection}
          isDeleted={item.isDeleted}
        />
      </Screen>
    )
  },
)

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
