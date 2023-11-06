import React, { FC, useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { Image, View } from "react-native"
import find from "lodash/find"
import { PlanStorageLimitModal } from "../../planStorageLimitModal"
import { useTheme } from "app/services/context"
import { useCipherData, useCipherHelper, useFolder, useHelper } from "app/services/hook"
import { useStores } from "app/models"
import { CipherView, IdentityView } from "core/models/view"
import { CollectionView } from "core/models/view/collectionView"
import { CipherType } from "core/enums"
import { Button, Header, Screen, TextInput, Text, Icon } from "app/components/cores"
import { Select } from "app/components/utils"
import { CipherOthersInfo, CustomFieldsEdit } from "app/components/ciphers"
import { BROWSE_ITEMS } from "app/navigators/navigators.route"
import { AppStackScreenProps } from "app/navigators/navigators.types"

type InputItem = {
  label: string
  value: string
  setter: (val: string) => void
  isRequired?: boolean
  type?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad"
}

export const IdentityEditScreen: FC<AppStackScreenProps<"identities__edit">> = observer((props) => {
  const navigation = props.navigation
  const route = props.route
  const { mode } = route.params
  const { colors } = useTheme()
  const { translate } = useHelper()
  const { shareFolderAddItem } = useFolder()
  const { createCipher, updateCipher } = useCipherData()
  const { newCipher } = useCipherHelper()
  const { cipherStore, collectionStore } = useStores()

  const selectedCipher: CipherView = cipherStore.cipherView
  const selectedCollection: CollectionView = route.params.collection

  // ------------------ PARAMS -----------------------

  const isOwner = (() => {
    if (!selectedCipher.organizationId) {
      return true
    }
    const org = cipherStore.myShares.find(
      (s) => s.organization_id === selectedCipher.organizationId,
    )
    return !!org
  })()

  const [isLoading, setIsLoading] = useState(false)

  // Forms
  const [name, setName] = useState(mode !== "add" ? selectedCipher.name : "")
  const [title, setTitle] = useState(mode !== "add" ? selectedCipher.identity.title : "")
  const [firstName, setFirstName] = useState(
    mode !== "add" ? selectedCipher.identity.firstName : "",
  )
  const [lastName, setLastName] = useState(mode !== "add" ? selectedCipher.identity.lastName : "")
  const [username, setUsername] = useState(mode !== "add" ? selectedCipher.identity.username : "")
  const [email, setEmail] = useState(mode !== "add" ? selectedCipher.identity.email : "")
  const [phone, setPhone] = useState(mode !== "add" ? selectedCipher.identity.phone : "")
  const [company, setCompany] = useState(mode !== "add" ? selectedCipher.identity.company : "")
  const [ssn, setSsn] = useState(mode !== "add" ? selectedCipher.identity.ssn : "")
  const [passport, setPassport] = useState(
    mode !== "add" ? selectedCipher.identity.passportNumber : "",
  )
  const [license, setLicense] = useState(
    mode !== "add" ? selectedCipher.identity.licenseNumber : "",
  )
  const [address1, setAddress1] = useState(mode !== "add" ? selectedCipher.identity.address1 : "")
  const [address2, setAddress2] = useState(mode !== "add" ? selectedCipher.identity.address2 : "")
  // const [address3, setAddress3] = useState(mode !== 'add' ? selectedCipher.identity.address3 : '')
  const [city, setCity] = useState(mode !== "add" ? selectedCipher.identity.city : "")
  const [state, setState] = useState(mode !== "add" ? selectedCipher.identity.state : "")
  const [zip, setZip] = useState(mode !== "add" ? selectedCipher.identity.postalCode : "")
  const [country, setCountry] = useState(mode !== "add" ? selectedCipher.identity.country : "")
  const [note, setNote] = useState(mode !== "add" ? selectedCipher.notes : "")
  const [folder, setFolder] = useState(mode !== "add" ? selectedCipher.folderId : null)
  const [organizationId, setOrganizationId] = useState(
    mode === "edit" ? selectedCipher.organizationId : null,
  )
  const [collectionIds, setCollectionIds] = useState(
    mode !== "add" ? selectedCipher.collectionIds : [],
  )
  const [collection, setCollection] = useState(
    mode !== "add" && collectionIds.length > 0 ? collectionIds[0] : null,
  )
  const [fields, setFields] = useState(mode !== "add" ? selectedCipher.fields || [] : [])
  // plan storage limit modal
  const [isOpenModal, setIsOpenModal] = useState(false)
  // ------------------ EFFECTS -----------------------

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      if (cipherStore.selectedFolder) {
        if (cipherStore.selectedFolder === "unassigned") {
          setFolder(null)
        } else {
          if (!selectedCollection) setFolder(cipherStore.selectedFolder)
        }
        setCollection(null)
        setCollectionIds([])
        setOrganizationId(null)
        cipherStore.setSelectedFolder(null)
      }

      if (cipherStore.selectedCollection) {
        if (!selectedCollection) setCollection(cipherStore.selectedCollection)
        setFolder(null)
        cipherStore.setSelectedCollection(null)
      }
    })

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ----------------------

  const handleSave = async () => {
    setIsLoading(true)
    let payload: CipherView
    if (mode === "add") {
      payload = newCipher(CipherType.Identity)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
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
    data.address2 = address2
    // data.address3 = address3
    data.city = city
    data.state = state
    data.postalCode = zip
    data.country = country

    payload.fields = fields
    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.identity = data
    payload.organizationId = organizationId

    let res = { kind: "unknown" }
    if (["add", "clone"].includes(mode)) {
      res = await createCipher(payload, 0, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, 0, collectionIds)
    }

    if (res.kind === "ok") {
      if (isOwner) {
        // for shared folder
        if (selectedCollection) {
          await shareFolderAddItem(selectedCollection, payload)
        }

        if (collection) {
          const collectionView = find(collectionStore.collections, (e) => e.id === collection) || {}
          await shareFolderAddItem(collectionView, payload)
        }
      }

      navigation.goBack()
    } else {
      setIsLoading(false)

      // reach limit plan stogare
      // @ts-ignore
      if (res?.data?.code === "5002") {
        setIsOpenModal(true)
      }
    }
  }

  // ----------------- RENDER ----------------------

  const contactDetails: InputItem[] = [
    {
      label: translate("identity.first_name"),
      value: firstName,
      setter: setFirstName,
    },
    {
      label: translate("identity.last_name"),
      value: lastName,
      setter: setLastName,
    },
    {
      label: translate("identity.username"),
      value: username,
      setter: setUsername,
    },
    {
      label: translate("identity.email"),
      value: email,
      setter: setEmail,
      type: "email-address",
    },
    {
      label: translate("identity.company"),
      value: company,
      setter: setCompany,
    },
    {
      label: translate("identity.phone"),
      value: phone,
      setter: setPhone,
      type: "numeric",
    },
    {
      label: translate("identity.ssn"),
      value: ssn,
      setter: setSsn,
      type: "numeric",
    },
    {
      label: translate("identity.passport"),
      value: passport,
      setter: setPassport,
      type: "numeric",
    },
    {
      label: translate("identity.license"),
      value: license,
      setter: setLicense,
      type: "numeric",
    },
  ]

  const addressDetails: InputItem[] = [
    {
      label: translate("identity.address") + " 1",
      value: address1,
      setter: setAddress1,
    },
    {
      label: translate("identity.address") + " 2",
      value: address2,
      setter: setAddress2,
    },
    // {
    //   label: translate('identity.address') + ' 3',
    //   value: address3,
    //   setter: setAddress3
    // },
    {
      label: translate("identity.city"),
      value: city,
      setter: setCity,
    },
    {
      label: translate("identity.state"),
      value: state,
      setter: setState,
    },
    {
      label: translate("identity.zip"),
      value: zip,
      setter: setZip,
      type: "numeric",
    },
    {
      label: translate("identity.country"),
      value: country,
      setter: setCountry,
    },
  ]

  const TITLES = [
    {
      label: "mr",
      value: "mr",
    },
    {
      label: "mrs",
      value: "mrs",
    },
    {
      label: "ms",
      value: "ms",
    },
    {
      label: "dr",
      value: "dr",
    },
  ]

  return (
    <Screen
      preset="auto"
      safeAreaEdges={["bottom"]}
      header={
        <Header
          title={
            mode === "add"
              ? `${translate("common.add")} ${translate("common.identity")}`
              : translate("common.edit")
          }
          leftText={translate("common.cancel")}
          onLeftPress={() => navigation.goBack()}
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
    >
      <PlanStorageLimitModal isOpen={isOpenModal} onClose={() => setIsOpenModal(false)} />

      {/* Name */}
      <View style={{ padding: 16, paddingTop: 0 }}>
        <View style={{ flexDirection: "row" }}>
          <Image
            source={BROWSE_ITEMS.identity.icon}
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
        <Text preset="label" size="base" text={translate("identity.personal_info").toUpperCase()} />
      </View>

      {/* Info */}
      <View
        style={{
          padding: 16,
          paddingBottom: 32,
        }}
      >
        <Select
          placeholder={translate("identity.title")}
          value={title}
          options={TITLES}
          onChange={(val) => setTitle(val.toString())}
          renderSelected={({ label }) => (
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text preset="bold" text={label + ": "} />
                {!!title && <Text preset="bold" text={title} style={{ marginTop: 4 }} />}
              </View>
              <Icon icon="caret-right" size={20} color={colors.secondaryText} />
            </View>
          )}
        />

        {contactDetails.map((item, index) => (
          <TextInput
            animated
            key={index}
            isRequired={item.isRequired}
            keyboardType={item.type || "default"}
            label={item.label}
            value={item.value}
            onChangeText={(text) => item.setter(text)}
          />
        ))}
      </View>

      <View style={{ padding: 16, backgroundColor: colors.block }}>
        <Text
          preset="label"
          size="base"
          text={translate("identity.address_details").toUpperCase()}
        />
      </View>

      {/* Address */}
      <View
        style={{
          backgroundColor: colors.background,
          padding: 16,
          paddingTop: 0,
        }}
      >
        {addressDetails.map((item, index) => (
          <TextInput
            animated
            key={index}
            isRequired={item.isRequired}
            keyboardType={item.type || "default"}
            label={item.label}
            value={item.value}
            onChangeText={(text) => item.setter(text)}
          />
        ))}
      </View>

      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />

      <CipherOthersInfo
        isOwner={isOwner}
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
        folderId={folder}
        collectionId={collection}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
        isDeleted={selectedCipher.isDeleted}
      />
    </Screen>
  )
})
