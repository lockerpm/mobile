import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Header, Icon, Screen } from "../../../components/cores"
import {
  Text,
  AutoImage as Image,
  ActionSheet,
  Divider,
  ActionSheetContent,
  Button,
} from "../../../components"
import { useMixins } from "../../../services/mixins"
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native"
import { PrimaryParamList } from "../../../navigators"
import { useCipherHelpersMixins } from "../../../services/mixins/cipher/helpers"
import { useStores } from "../../../models"
import { TextInput, TouchableOpacity, View } from "react-native"
import { commonStyles } from "../../../theme"

const ExpireData = [
  {
    vi: "1 hour",
    en: "1 hour",
    val: "1h",
  },
  {
    vi: "24 hours",
    en: "24 hours",
    val: "24",
  },
  {
    vi: "7 days",
    en: "7 days",
    val: "7d",
  },
  {
    vi: "14 days",
    en: "14 days",
    val: "14d",
  },
  {
    vi: "30 days",
    en: "30 days",
    val: "30d",
  },
  {
    vi: "No expires",
    en: "No expires",
    val: "-1",
  },
]

export const QuickSharesScreen = observer(() => {
  const { translate, color } = useMixins()
  const { getCipherDescription } = useCipherHelpersMixins()
  const { cipherStore, user } = useStores()
  const { getCipherInfo } = useCipherHelpersMixins()
  const route = useRoute<RouteProp<PrimaryParamList, "quick_shares">>()
  const navigation = useNavigation()

  // --------------------COMPUTED-----------------------------
  const cipherView = route.params.cipher
  const cipherInfo = getCipherInfo(cipherView)
  const cipher = {
    ...cipherView,
    logo: cipherInfo.backup,
    imgLogo: cipherInfo.img,
    svg: cipherInfo.svg,
    notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
      cipherView.id,
    ),
    isDeleted: cipherView.isDeleted,
  }

  // --------------------PARAMS-----------------------------
  const [shareForAnyone, setShareForAnyone] = useState(true)

  const [openExpireSelect, setOpenExpireSelect] = useState(false)
  const [expires, setExpires] = useState(-1)

  const [openLimitSelect, setOpenLimitSelect] = useState(false)
  const [unlimitAccess, setUnlimitAccess] = useState(true)
  const [limitNumAccess, setLimitNumAccess] = useState(-1)

  const [email, setEmail] = useState("")
  const [emails, setEmails] = useState<string[]>([])

  const addEmail = () => {
    const e = email.trim().toLowerCase()
    if (!!e && !emails.includes(e)) {
      setEmails([...emails, e])
    }
    setEmail("")
  }
  const removeEmail = (val: string) => {
    setEmails(emails.filter((e) => e !== val))
  }
  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      header={
        <Header
          leftText={translate("common.cancel")}
          onLeftPress={() => navigation.goBack()}
          title={"Get shareable link"}
        />
      }
      footer={
        <Button
          text="Get Link to Share"
          style={{
            marginHorizontal: 16,
          }}
        />
      }
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
        {/* Cipher avatar */}
        {cipher.svg ? (
          <cipher.svg height={40} width={40} />
        ) : (
          <Image
            source={cipher.imgLogo || cipher.logo}
            backupSource={cipher.logo}
            style={{
              height: 40,
              width: 40,
              borderRadius: 8,
            }}
          />
        )}
        {/* Cipher avatar end */}

        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Name */}
          <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
            <Text preset="semibold" numberOfLines={1} text={cipher.name} />
          </View>
          {/* Name end */}

          {/* Description */}
          {!!getCipherDescription(cipherView) && (
            <Text
              text={getCipherDescription(cipherView)}
              style={{ fontSize: 14 }}
              numberOfLines={1}
            />
          )}
          {/* Description end */}
        </View>
      </View>

      <Text
        preset="semibold"
        text="General access"
        style={{
          marginTop: 24,
          marginBottom: 4,
        }}
      />

      <QuickShareOption
        isAnyone
        isSelect={shareForAnyone}
        action={() => {
          setShareForAnyone(true)
        }}
        text={"Anyone with the link"}
      />
      <QuickShareOption
        isAnyone={false}
        isSelect={!shareForAnyone}
        action={() => {
          setShareForAnyone(false)
        }}
        text={"Only invited people"}
      />

      {!shareForAnyone && (
        <View
          style={{
            marginTop: 16,
          }}
        >
          <Text
            preset="semibold"
            text="Email addresses for the people to share this with"
            style={{
              marginBottom: 12,
            }}
          />
          <View
            style={{
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderRadius: 8,
              borderColor: color.line,
              padding: 2,
              paddingLeft: 12,
            }}
          >
            <TextInput
              placeholder={translate("shares.share_folder.add_email")}
              placeholderTextColor={color.text}
              selectionColor={color.primary}
              onChangeText={setEmail}
              value={email}
              clearButtonMode="unless-editing"
              clearTextOnFocus={true}
              onSubmitEditing={addEmail}
              style={{
                color: color.textBlack,
                flex: 1,
              }}
            />

            <Button
              isDisabled={!email}
              text="Add"
              style={{
                width: 60,
                height: 20,
                paddingHorizontal: 0,
              }}
              onPress={addEmail}
            />
          </View>
          <Text
            text="They’ll need to verify their email before they can access the item"
            style={{
              marginTop: 12,
              marginBottom: 12,
            }}
          />
        </View>
      )}

      {!shareForAnyone &&
        emails.map((e, index) => {
          return (
            <View
              key={index}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 8,
              }}
            >
              <Text preset="black" text={e} />
              <Icon icon="trash" onPress={() => removeEmail(e)} />
            </View>
          )
        })}

      <Text preset="semibold" text="Link expires after" style={{ marginVertical: 12 }} />

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 8,
          borderColor: color.line,
          padding: 12,
        }}
        onPress={() => {
          setOpenExpireSelect(true)
        }}
      >
        <Text preset="black" text="asdasd" />
        {/* <AntDesign
          icon={"down"}
          color={color.textBlack}
          style={{
            width: 24,
            height: 24,
            backgroundColor: "red"
          }}
        /> */}
      </TouchableOpacity>

      <Text text="or" style={{ marginVertical: 12 }} />

      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderRadius: 8,
          borderColor: color.line,
          padding: 12,
          justifyContent: "space-between",
          marginBottom: 12,
        }}
        onPress={() => {
          setOpenLimitSelect(true)
        }}
      >
        <Text preset="black" text="unlimit" />
      </TouchableOpacity>

      <ActionSheet
        isOpen={openExpireSelect}
        onClose={() => setOpenExpireSelect(false)}
        style={{ paddingHorizontal: 16 }}
      >
        <Text preset="bold" text="Link expries after" style={{ fontSize: 20 }} />
        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          {ExpireData.map((e) => (
            <TouchableOpacity key={e.en}>
              <Text
                preset="black"
                text={user.language === "em" ? e.en : e.vi}
                style={{
                  marginTop: 14,
                  marginBottom: 2,
                }}
              />
              <Divider style={{ marginTop: 10 }} />
            </TouchableOpacity>
          ))}
        </ActionSheetContent>
      </ActionSheet>

      <ActionSheet
        isOpen={openLimitSelect}
        onClose={() => setOpenLimitSelect(false)}
        style={{ paddingHorizontal: 16 }}
      >
        <Text preset="bold" text="Link expries after" style={{ fontSize: 20 }} />
        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
            <TouchableOpacity >
              <Text
                preset="black"
                text={"Time access"}
                style={{
                  marginTop: 14,
                  marginBottom: 2,
                }}
              />
            </TouchableOpacity>
            <TouchableOpacity >
              <Text
                preset="black"
                text={"Unlimited access"}
                style={{
                  marginTop: 14,
                  marginBottom: 2,
                }}
              />
            </TouchableOpacity>
        </ActionSheetContent>
      </ActionSheet>
    </Screen>
  )
})

interface QuickShareOptionProps {
  isAnyone: boolean
  isSelect: boolean
  action: () => void
  text: string
}

const QuickShareOption = ({ isAnyone, isSelect, action, text }: QuickShareOptionProps) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 5,
        marginVertical: 5,
      }}
      onPress={action}
    >
      <Icon icon={isSelect ? "checkbox-check" : "checkbox"} size={24} />
      <Text preset="black" text={text} style={{ marginLeft: 12 }} />
    </TouchableOpacity>
  )
}
