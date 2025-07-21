import { useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { View, Image, StyleSheet, ViewStyle } from "react-native"
import { TextInputMaskOptionProp, TextInputMaskTypeProp } from "react-native-masked-text"
import { useCipherData, useFolder } from "app/services/hook"
import { CardView, CipherView, FieldView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { Header, Screen, TextInput, Text } from "app/components/cores"
import { BrandSelectItem } from "./BrandSelectItem"
import { BrowseScreenProps } from "app/navigators"
import { CipherAppView, CipherEditHelperModal, CipherEditMode } from "app/static/types"
import { CARD_BRANDS } from "app/static/constants"
import { FolderView } from "core/models/view/folderView"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/ciphers"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { TxKeyPath } from "@/i18n"

// Card detection logic
const detectCardBrand = (cardNumber: string) => {
  const number = cardNumber.replace(/\D/g, "")

  const cardPatterns = [
    { value: "Visa", regex: /^4\d{0,15}$/ },
    { value: "Mastercard", regex: /^(5[1-5]|2[2-7])\d{0,14}$/ },
    { value: "Amex", regex: /^3[47]\d{0,13}$/ },
    { value: "Discover", regex: /^6(?:011|5\d{2}|4[4-9])\d{0,12}$/ },
    { value: "Diners Club", regex: /^3(?:0[0-5]|[68])\d{0,11}$/ },
    { value: "JCB", regex: /^(?:2131|1800|35\d{0,3})\d{0,11}$/ },
    { value: "Maestro", regex: /^(?:5[06789]|6\d)\d{0,17}$/ },
    { value: "UnionPay", regex: /^62\d{0,17}$/ },
  ]

  for (const { value, regex } of cardPatterns) {
    if (regex.test(number)) {
      return CARD_BRANDS.find((b) => b.value === value)
    }
  }

  return CARD_BRANDS.find((b) => b.value === "Other")
}

type InputItem = {
  label: TxKeyPath
  value: string
  setter: (val: any) => void
  isRequired?: boolean
  inputType?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad"
  placeholder?: string
  isPassword?: boolean
  maskType?: TextInputMaskTypeProp
  maskOptions?: TextInputMaskOptionProp
  isBrandSelect?: boolean
  options?: { label: string; value: string | number | null }[]
}

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
        data.expMonth = splitDate[0]
        data.expYear = splitDate[1]
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

    // Render
    const cardDetails: InputItem[] = [
      {
        label: "card:card_name",
        value: cardName,
        setter: setCardName,
        isRequired: true,
        placeholder: "...",
      },
      {
        label: "card:brand",
        value: brand,
        setter: setBrand,
        isBrandSelect: true,
        options: CARD_BRANDS,
      },
      {
        label: "card:card_number",
        value: cardNumber,
        setter: (text) => {
          setCardNumber(text)
          setBrand(detectCardBrand(text)?.value || "")
        },
        inputType: "numeric",
        maskType: "credit-card",
        placeholder: "0000 0000 0000 0000",
      },
      {
        label: "card:exp_date",
        value: expDate,
        setter: setExpDate,
        inputType: "numeric",
        maskType: "datetime",
        maskOptions: {
          format: "MM/YY",
        },
        placeholder: "MM/YY",
      },
      {
        label: "card:cvv",
        value: securityCode,
        setter: setSecurityCode,
        maskOptions: {
          mask: brand === "Amex" ? "9999" : "999",
        },
        inputType: "numeric",
        placeholder: brand === "Amex" ? "0000" : "000",
        isPassword: true,
      },
    ]

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
          <Image resizeMode="contain" source={item.imgLogo} style={styles.logo} />
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
          {cardDetails.map((item, index) => (
            <View key={index}>
              {item.isBrandSelect ? (
                <BrandSelectItem brand={item.value} setBrand={(val) => item.setter(val)} />
              ) : (
                <TextInput
                  animated
                  isRequired={item.isRequired}
                  isPassword={item.isPassword}
                  keyboardType={item.inputType || "default"}
                  maskType={item.maskType}
                  maskOptions={item.maskOptions}
                  labelTx={item.label}
                  value={item.value}
                  onChangeText={(text) => {
                    item.setter(text)
                  }}
                  placeholder={item.placeholder}
                />
              )}
            </View>
          ))}
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
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
