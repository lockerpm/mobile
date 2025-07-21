import { useCallback, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Image, TouchableOpacity, StyleSheet, ViewStyle } from "react-native"
import { ChainSelect } from "./ChainSelect"
import { AppSelect } from "./AppSelect"
import { useCipherData, useCipherHelper, useFolder } from "app/services/hook"
import { CipherView, FieldView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { CryptoWalletData, toCryptoWalletData } from "app/utils/crypto"
import { Header, Screen, TextInput, Text, Icon } from "app/components/cores"
import { PasswordStrength } from "app/components/utils"
import { BrowseScreenProps } from "app/navigators"
import { CipherAppView, CipherEditHelperModal, CipherEditMode } from "app/static/types"
import { CipherOthersInfo, CustomFieldsEdit, SeedPhraseInput } from "app/components/ciphers"
import { FolderView } from "core/models/view/folderView"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { AppEventType, EventBus } from "@/utils/eventBus"

type Props = {
  item: CipherAppView
  mode: CipherEditMode
  navigation: BrowseScreenProps<"cipherEdit">["navigation"]

  // other common info
  folder?: FolderView
  collection?: CollectionView
  collectionIds: string[]
  organizationId: string | null

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
    const {
      themed,
      theme: { colors },
    } = useAppTheme()
    const { shareFolderAddItem } = useFolder()
    const { getPasswordStrength } = useCipherHelper()
    const { createCipher, updateCipher } = useCipherData()

    const cryptoWalletData = toCryptoWalletData(item.notes)

    // ------------------------- PARAMS ------------------------------------

    const [name, setName] = useState(item.name)

    const [walletApp, setWalletApp] = useState(cryptoWalletData.walletApp)
    const [username, setUsername] = useState(cryptoWalletData.username)
    const [password, setPassword] = useState(cryptoWalletData.password)
    const [pin, setPin] = useState(cryptoWalletData.pin)
    const [address, setAddress] = useState(cryptoWalletData.address)
    const [privateKey, setPrivateKey] = useState(cryptoWalletData.privateKey)
    const [seed, setSeed] = useState(cryptoWalletData.seed)
    const [networks, setNetworks] = useState<{ alias: string; name: string }[]>(
      cryptoWalletData.networks
    )
    const [fields, setFields] = useState<FieldView[]>(item.fields ?? [])
    const [note, setNote] = useState(cryptoWalletData.notes) // custom note for the cipher, not use in CipherType SecureNote

    const [isLoading, setIsLoading] = useState(false)
    // -------------------------- COMPUTED ------------------------------

    // -------------------------- METHODS ------------------------------

    const navigatePlanStorageLimit = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.PLAN_STORAGE_LIMIT,
      })
    }, [navigation])

    const navigateGeneratePassword = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.GENERATE_PASSWORD,
      })
    }, [navigation])

    const handleSave = async () => {
      setIsLoading(true)
      // @ts-ignore
      const payload: CipherView = { ...item }

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
      payload.organizationId = organizationId as string
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
        if (isOwner && collection) {
          await shareFolderAddItem(collection, payload)
        }
        setIsLoading(false)
        navigation.goBack()
      } else {
        setIsLoading(false)

        // reach limit plan stogare
        // @ts-ignore
        if (res?.data?.code === "5002") {
          navigatePlanStorageLimit()
        }
      }
    }
    // ----------------- EFFECT ------------------

    useEffect(() => {
      const listener2 = EventBus.createListener(
        AppEventType.CIPHER_EDIT_GENERATE_PASSWORD,
        (password: string) => {
          setPassword(password)
        }
      )

      return () => {
        EventBus.removeListener(listener2)
      }
    }, [])

    // -------------------------- RENDER ------------------------------

    const PasswordAccessory = useCallback(
      ({ style }: { style: ViewStyle }) => (
        <TouchableOpacity onPress={navigateGeneratePassword} style={[style, styles.accessory]}>
          <Text preset="bold" color={colors.primary} tx={"common:generate"} />
          <Icon icon="arrow-clockwise" size={18} color={colors.primary} style={styles.mt2} />
        </TouchableOpacity>
      ),
      [colors.primary]
    )

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            titleTx={mode === "add" ? "common:add" : "common:edit"}
            onLeftPress={() => navigation.goBack()}
            leftTx={"common:cancel"}
            rightTx="common:save"
            rightLoading={isLoading}
            rightDisabled={isLoading || !name.trim()}
            onRightPress={handleSave}
            rightIconColor={colors.primary}
          />
        }
        ScrollViewProps={{
          contentContainerStyle: styles.scrollContainer,
        }}
      >
        <View style={styles.header}>
          <Image resizeMode="contain" source={item.imgLogo} style={styles.logo} />
          <View style={styles.flex}>
            <TextInput
              animated
              isRequired
              labelTx="common:item_name"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={themed($block)}>
          <Text preset="label" size="sm" tx={"common:details"} />
        </View>

        <View style={styles.infoContainer}>
          <AppSelect
            alias={walletApp.alias}
            onChange={(alias: string, appName: string) => {
              setWalletApp({ alias, name: appName })
            }}
          />

          <TextInput
            animated
            labelTx={"common:username"}
            value={username}
            onChangeText={setUsername}
          />

          {/* Password */}
          <TextInput
            isPassword
            animated
            labelTx={"common:password"}
            value={password}
            onChangeText={setPassword}
            RightAccessory={!password ? PasswordAccessory : undefined}
          />
          {!!password && (
            <PasswordStrength value={getPasswordStrength(password).score} style={styles.mt8} />
          )}

          <TextInput animated isPassword label={"PIN"} value={pin} onChangeText={setPin} />

          <TextInput
            animated
            labelTx={"crypto_asset:wallet_address"}
            value={address}
            onChangeText={setAddress}
          />

          <TextInput
            isPassword
            animated
            labelTx={"crypto_asset:private_key"}
            value={privateKey}
            onChangeText={setPrivateKey}
          />

          {/* Seed */}
          <View style={styles.item}>
            <Text preset="label" size="sm" tx={"crypto_asset:seed"} />
            <SeedPhraseInput seed={seed} setSeed={setSeed} />
          </View>

          <View style={styles.item}>
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
  }
)

const $block: ThemedStyle<ViewStyle> = ({ colors }) => ({
  padding: 16,
  paddingVertical: 8,
  backgroundColor: colors.block,
})

const styles = StyleSheet.create({
  accessory: {
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 8,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
  },
  infoContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  item: {
    flex: 1,
    marginTop: 16,
  },
  logo: {
    height: 50,
    marginRight: 10,
    marginTop: 26,
    width: 50,
  },
  mt16: {
    marginTop: 16,
  },
  mt2: {
    marginTop: 2,
  },
  mt8: {
    marginTop: 8,
  },
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
