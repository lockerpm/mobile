import React, { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import find from "lodash/find"
import {
  Text,
  Layout,
  Button,
  Header,
  FloatingInput,
  CipherOthersInfo,
  CustomFieldsEdit,
} from "../../../../../components"
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native"
import { commonStyles, fontSize } from "../../../../../theme"
import { PrimaryParamList } from "../../../../../navigators/main-navigator"
import { BROWSE_ITEMS } from "../../../../../common/mappings"
import { useMixins } from "../../../../../services/mixins"
import { useStores } from "../../../../../models"
import { CipherView } from "../../../../../../core/models/view"
import { CipherType } from "../../../../../../core/enums"
import { useCipherDataMixins } from "../../../../../services/mixins/cipher/data"
import { useCipherHelpersMixins } from "../../../../../services/mixins/cipher/helpers"
import { toWirelessRouterData, WirelessRouterData } from "../wireless-router.type"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { useFolderMixins } from "../../../../../services/mixins/folder"

type EditScreenProp = RouteProp<PrimaryParamList, "wirelessRouters__edit">

type InputItem = {
  label: string
  value: string
  setter: (val: string) => void
  isRequired?: boolean
  type?: "default" | "email-address" | "numeric" | "phone-pad" | "number-pad" | "decimal-pad"
}

export const WirelessRouterEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<EditScreenProp>()
  const { mode } = route.params

  const { cipherStore, collectionStore } = useStores()
  const { translate, color } = useMixins()

  const { shareFolderAddItem } = useFolderMixins()
  const { newCipher } = useCipherHelpersMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const selectedCipher: CipherView = cipherStore.cipherView
  const wirelessRouterData = toWirelessRouterData(selectedCipher.notes)

  // ------------------ PARAMS -----------------------
  const selectedCollection: CollectionView = route.params.collection
  const isOwner = (() => {
    if (!selectedCipher.organizationId) {
      return true
    }
    const org = cipherStore.myShares.find(
      (s) => s.organization_id === selectedCipher.organizationId,
    )
    return !!org
  })()
  // Forms
  const [name, setName] = useState(mode !== "add" ? selectedCipher.name : "")

  const [deviceName, setDeviceName] = useState(mode !== "add" ? wirelessRouterData.deviceName : "")
  const [ipAddress, setIpAddress] = useState(mode !== "add" ? wirelessRouterData.ipAddress : "")
  const [adminUsername, setAdminUsername] = useState(
    mode !== "add" ? wirelessRouterData.adminUsername : "",
  )
  const [adminPassword, setAdminPassword] = useState(
    mode !== "add" ? wirelessRouterData.adminPassword : "",
  )
  const [wifiSSID, setWifiSSID] = useState(mode !== "add" ? wirelessRouterData.wifiSSID : "")
  const [wifiPassword, setWifiPassword] = useState(
    mode !== "add" ? wirelessRouterData.wifiPassword : "",
  )

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

  const [isLoading, setIsLoading] = useState(false)

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
      payload = newCipher(CipherType.WirelessRouter)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const wirelessRouterData: WirelessRouterData = {
      deviceName,
      ipAddress,
      adminUsername,
      adminPassword,
      wifiSSID,
      wifiPassword,
    }

    payload.fields = fields
    payload.name = name
    payload.notes = JSON.stringify(wirelessRouterData)
    payload.folderId = folder
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
    }
    setIsLoading(false)
  }

  // ----------------- RENDER ----------------------

  const wirelessRouterDetails: InputItem[] = [
    {
      label: translate("wireless_router.device_name"),
      value: deviceName,
      setter: setDeviceName,
    },
    {
      label: translate("wireless_router.router_ip_address"),
      value: ipAddress,
      setter: setIpAddress,
    },
    {
      label: translate("wireless_router.admin_username"),
      value: adminUsername,
      setter: setAdminUsername,
    },
    {
      label: translate("wireless_router.admin_password"),
      value: adminPassword,
      setter: setAdminPassword,
    },
    {
      label: translate("wireless_router.wifi_ssid"),
      value: wifiSSID,
      setter: setWifiSSID,
    },
    {
      label: translate("wireless_router.wifi_pw"),
      value: wifiPassword,
      setter: setWifiPassword,
    },
  ]

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      containerStyle={{
        backgroundColor: color.block,
        paddingHorizontal: 0,
      }}
      header={
        <Header
          title={
            mode === "add"
              ? `${translate("common.add")} ${translate("common.wireless_router")}`
              : translate("common.edit")
          }
          goBack={() => navigation.goBack()}
          goBackText={translate("common.cancel")}
          right={
            <Button
              preset="link"
              isDisabled={isLoading || !name.trim()}
              text={translate("common.save")}
              onPress={handleSave}
              style={{
                height: 35,
                alignItems: "center",
                paddingLeft: 10,
              }}
              textStyle={{
                fontSize: fontSize.p,
              }}
            />
          }
        />
      }
    >
      {/* Name */}
      <View style={[commonStyles.SECTION_PADDING, { backgroundColor: color.background }]}>
        <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
          <BROWSE_ITEMS.wirelessRouter.svgIcon height={40} width={40} />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <FloatingInput
              isRequired
              label={translate("common.item_name")}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate("common.wireless_router").toUpperCase()}
          style={{ fontSize: fontSize.small }}
        />
      </View>

      {/* Info */}
      <View
        style={[
          commonStyles.SECTION_PADDING,
          {
            backgroundColor: color.background,
            paddingBottom: 32,
          },
        ]}
      >
        {wirelessRouterDetails.map((e, index) => (
          <View key={index} style={{ flex: 1, marginTop: index === 0 ? 0 : 20 }}>
            <FloatingInput label={e.label} value={e.value} onChangeText={e.setter} />
          </View>
        ))}
      </View>
      {/* Info end */}

      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />
      {/* Custom fields end */}

      {/* Others */}
      <CipherOthersInfo
        isOwner={isOwner}
        navigation={navigation}
        hasNote
        folderId={folder}
        collectionId={collection}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
        isDeleted={selectedCipher.isDeleted}
      />
      {/* Others end */}
    </Layout>
  )
})
