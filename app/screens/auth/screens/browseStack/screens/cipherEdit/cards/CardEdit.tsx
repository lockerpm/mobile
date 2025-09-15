import { useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Image, StyleSheet, ViewStyle } from "react-native"
import { useCipherData, useFolder } from "app/services/hook"
import { CardView, CipherView, FieldView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { Header, Screen, TextInput, Text } from "app/components/cores"
import { BrowseScreenProps } from "app/navigators"
import { CipherAppView, CipherEditHelperModal, CipherEditMode } from "app/static/types"
import { CARD_BRANDS } from "app/static/constants"
import { FolderView } from "core/models/view/folderView"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/ciphers"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { detectCardBrand } from "@/utils/cipherHelper"

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

export const CardEdit = observer(
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
    const { createCipher, updateCipher } = useCipherData()

    // ----------------- PARAMS ------------------
    const [isLoading, setIsLoading] = useState(false)

    // form
    const [name, setName] = useState(item.name)
    const [cardName, setCardName] = useState(item.card.cardholderName)
    const [brand, setBrand] = useState(item.card.brand)
    const [cardNumber, setCardNumber] = useState(item.card.number)
    const [expDate, setExpDate] = useState(
      mode !== "add" ? `${item.card.expMonth}/${item.card.expYear}` : ""
    )
    const [securityCode, setSecurityCode] = useState(item.card.code)

    // other
    const [fields, setFields] = useState<FieldView[]>(item.fields ?? [])
    const [note, setNote] = useState(item.notes)

    const brandItem = CARD_BRANDS.find((b) => b.value === brand)

    // ----------------- METHODS ------------------

    const navigatePlanStorageLimit = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.PLAN_STORAGE_LIMIT,
      })
    }, [navigation])

    const handleSave = async () => {
      setIsLoading(true)
      // @ts-ignore
      const payload: CipherView = { ...item }

      const data = new CardView()
      data.cardholderName = cardName
      data.brand = brand
      data.number = cardNumber
      if (expDate) {
        const splitDate = expDate.split("/")
        if (splitDate.length === 2) {
          data.expMonth = splitDate[0]
          data.expYear = splitDate[1]
        }
      }
      data.code = securityCode

      payload.fields = fields
      payload.name = name
      payload.notes = note
      payload.folderId = folder?.id || ""
      payload.card = data
      payload.organizationId = organizationId as string

      let res = { kind: "unknown" }
      if (["add", "clone"].includes(mode)) {
        res = await createCipher(payload, 0, collectionIds)
      } else {
        res = await updateCipher(payload.id, payload, 0, collectionIds)
      }

      if (res.kind === "ok") {
        // for shared folder
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

    return (
      <Screen
        preset="auto"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            titleTx={mode === "add" ? "common:add" : "common:edit"}
            leftTx={"common:cancel"}
            onLeftPress={navigation.goBack}
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
          <Image
            resizeMode="contain"
            source={brandItem?.logo || item.imgLogo}
            style={styles.logo}
          />
          <View style={styles.flex}>
            <TextInput
              animated
              isRequired
              labelTx={"common:item_name"}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={themed($block)}>
          <Text preset="label" size="sm" tx={"card:card_details"} />
        </View>

        <View style={styles.infoContainer}>
          <TextInput
            animated
            isRequired
            labelTx={"card:card_name"}
            value={cardName}
            onChangeText={setCardName}
            placeholder={"..."}
          />
          <View style={styles.row2}>
            <TextInput
              animated
              keyboardType={"numeric"}
              maskType={"credit-card"}
              labelTx={"card:card_number"}
              value={cardNumber}
              onChangeText={(text) => {
                setCardNumber(text)
                setBrand(detectCardBrand(text)?.value || "")
              }}
              placeholder={"0000 0000 0000 0000"}
            />

            <View style={styles.brandContainer}>
              {!!brand && (
                <View style={themed($brand)}>
                  <Image source={brandItem?.logo || item.imgLogo} style={styles.logoBrand} />
                </View>
              )}
            </View>
          </View>

          <TextInput
            animated
            keyboardType={"numeric"}
            maskType={"datetime"}
            maskOptions={{
              format: "MM/YY",
            }}
            labelTx={"card:exp_date"}
            value={expDate}
            onChangeText={setExpDate}
            placeholder={"MM/YY"}
          />
          <TextInput
            animated
            isPassword
            keyboardType={"numeric"}
            maskOptions={{
              mask: brand === "Amex" ? "9999" : "999",
            }}
            labelTx={"card:cvv"}
            value={securityCode}
            onChangeText={setSecurityCode}
            placeholder={brand === "Amex" ? "0000" : "000"}
          />
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

const $brand: ThemedStyle<ViewStyle> = ({ colors }) => ({
  borderRadius: 4,
  borderColor: colors.border,
  borderWidth: 1,
  overflow: "hidden",
})

const styles = StyleSheet.create({
  brandContainer: {
    bottom: 2,
    height: 50,
    justifyContent: "center",
    position: "absolute",
    right: 16,
  },
  flex: {
    flex: 1,
  },
  header: { flexDirection: "row", padding: 16, paddingTop: 0 },
  infoContainer: {
    marginTop: -16,
    padding: 16,
    paddingBottom: 32,
  },
  logo: {
    height: 50,
    marginRight: 10,
    marginTop: 26,
    width: 50,
  },
  logoBrand: {
    height: 32,
    width: 42,
  },
  row2: {
    alignItems: "center",
    flexDirection: "row",
  },
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
