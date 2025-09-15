import { useCallback, useState } from "react"
import { observer } from "mobx-react-lite"
import { Image, View, StyleSheet, ViewStyle } from "react-native"
import { useCipherData, useFolder } from "app/services/hook"
import { CipherView, FieldView, IdentityView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { Header, Screen, TextInput, Text } from "app/components/cores"
import { SetIDTitle } from "./SetIDTitle"
import { BrowseScreenProps } from "app/navigators"
import { CipherAppView, CipherEditHelperModal, CipherEditMode } from "app/static/types"
import { FolderView } from "core/models/view/folderView"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/ciphers"
import StaticSafeAreaInsets from "react-native-static-safe-area-insets"
import { useAppTheme } from "@/utils/useAppTheme"
import { ThemedStyle } from "@/theme"
import { VAULT_LOGO } from "@/static/vault"
import { TxKeyPath } from "@/i18n"

type InputItem = {
  label: TxKeyPath
  value: string
  setter: (val: string) => void
  isRequired?: boolean
  type?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad"
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

export const IdentityEdit = observer(
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

    // ------------------ PARAMS -----------------------

    const [isLoading, setIsLoading] = useState(false)

    // Forms
    const [name, setName] = useState(item.name)
    const [title, setTitle] = useState(item.identity.title)
    const [firstName, setFirstName] = useState(item.identity.firstName)
    const [lastName, setLastName] = useState(item.identity.lastName)
    const [username, setUsername] = useState(item.identity.username)
    const [email, setEmail] = useState(item.identity.email)
    const [phone, setPhone] = useState(item.identity.phone)
    const [company, setCompany] = useState(item.identity.company)
    const [ssn, setSsn] = useState(item.identity.ssn)
    const [passport, setPassport] = useState(item.identity.passportNumber)
    const [license, setLicense] = useState(item.identity.licenseNumber)
    const [address1, setAddress1] = useState(item.identity.address1)
    const [city, setCity] = useState(item.identity.city)
    const [state, setState] = useState(item.identity.state)
    const [zip, setZip] = useState(item.identity.postalCode)
    const [country, setCountry] = useState(item.identity.country)

    // other
    const [fields, setFields] = useState<FieldView[]>(item.fields ?? [])
    const [note, setNote] = useState(item.notes) // custom note for the cipher, not use in CipherType SecureNote

    // ----------------- METHODS ----------------------

    const navigatePlanStorageLimit = useCallback(() => {
      navigation.navigate("cipherEditHelperModal", {
        mode: CipherEditHelperModal.PLAN_STORAGE_LIMIT,
      })
    }, [navigation])

    const handleSave = async () => {
      setIsLoading(true)
      // @ts-ignore
      const payload: CipherView = {
        ...item,
      }

      const data = new IdentityView()
      data.title = title
      data.firstName = firstName
      data.lastName = lastName
      data.username = username
      data.email = email
      data.company = company
      data.phone = phone
      data.ssn = ssn
      data.passportNumber = passport
      data.licenseNumber = license
      data.address1 = address1
      // data.address3 = address3
      data.city = city
      data.state = state
      data.postalCode = zip
      data.country = country

      payload.fields = fields
      payload.name = name
      payload.notes = note
      payload.folderId = folder?.id || ""
      payload.identity = data
      payload.organizationId = organizationId as string

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

    // ----------------- RENDER ----------------------

    const contactDetails: InputItem[] = [
      {
        label: "identity:first_name",
        value: firstName,
        setter: setFirstName,
      },
      {
        label: "identity:last_name",
        value: lastName,
        setter: setLastName,
      },
      {
        label: "identity:username",
        value: username,
        setter: setUsername,
      },
      {
        label: "identity:email",
        value: email,
        setter: setEmail,
        type: "email-address",
      },
      {
        label: "identity:company",
        value: company,
        setter: setCompany,
      },
      {
        label: "identity:phone",
        value: phone,
        setter: setPhone,
        type: "numeric",
      },
      {
        label: "identity:ssn",
        value: ssn,
        setter: setSsn,
        type: "numeric",
      },
      {
        label: "identity:passport",
        value: passport,
        setter: setPassport,
        type: "numeric",
      },
      {
        label: "identity:license",
        value: license,
        setter: setLicense,
        type: "numeric",
      },
    ]

    const addressDetails: InputItem[] = [
      {
        label: "identity:address",
        value: address1,
        setter: setAddress1,
      },
      {
        label: "identity:city",
        value: city,
        setter: setCity,
      },
      {
        label: "identity:state",
        value: state,
        setter: setState,
      },
      {
        label: "identity:zip",
        value: zip,
        setter: setZip,
      },
      {
        label: "identity:country",
        value: country,
        setter: setCountry,
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
            onLeftPress={() => navigation.goBack()}
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
          <Image resizeMode="contain" source={VAULT_LOGO.identities} style={styles.image} />

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
          <Text preset="label" size="sm" tx={"identity:personal_info"} />
        </View>

        {/* Info */}
        <View style={styles.info}>
          <SetIDTitle title={title} setTitle={setTitle} />

          {contactDetails.map((item, index) => (
            <TextInput
              animated
              key={index}
              isRequired={item.isRequired}
              keyboardType={item.type || "default"}
              labelTx={item.label}
              value={item.value}
              onChangeText={(text) => item.setter(text)}
            />
          ))}
        </View>

        <View style={themed($block)}>
          <Text preset="label" size="sm" tx={"identity:address_details"} />
        </View>

        {/* Address */}
        <View style={styles.address}>
          {addressDetails.map((item, index) => (
            <TextInput
              animated
              key={index}
              isRequired={item.isRequired}
              keyboardType={item.type || "default"}
              labelTx={item.label}
              value={item.value}
              onChangeText={(text) => item.setter(text)}
            />
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
  address: {
    padding: 16,
    paddingTop: 0,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    padding: 16,
    paddingTop: 0,
  },
  image: {
    height: 50,
    marginRight: 10,
    marginTop: 26,
    width: 50,
  },
  info: {
    padding: 16,
    paddingBottom: 20,
    paddingTop: 24,
  },
  scrollContainer: {
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom,
  },
})
