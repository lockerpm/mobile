import { observer } from "mobx-react-lite"
import React, { useRef, useState } from "react"
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
import { Dimensions, TextInput, TouchableOpacity, View } from "react-native"
import { commonStyles } from "../../../theme"
import { CipherType } from "../../../../core/enums"
import { Send } from "../../../../core/models/domain/send"
import { SendView } from "../../../../core/models/view/sendView"
import { useCoreService } from "../../../services/core-service"
import { SendRequest } from "../../../../core/models/request/sendRequest"
import Animated from "react-native-reanimated"
import { Utils } from "../../../../core/misc/utils"
import moment from "moment"

const { width } = Dimensions.get("screen")

export const QuickSharesScreen = observer(() => {
  const { translate, copyToClipboard, notifyApiError } = useMixins()
  const { sendService } = useCoreService()
  const { getCipherDescription, getCipherInfo } = useCipherHelpersMixins()
  const { cipherStore } = useStores()
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
  const scrollViewRef = useRef(null)
  const [page, setPage] = useState<0 | 1>(0)
  const [isSharing, setIsSharing] = useState(false)

  const [requireOtp, setRequireOtp] = useState(false)

  const [expireAfter, setExpireAfter] = useState<null | number>(null)

  const [countAccess, setCountAccess] = useState(false)
  const [viewOnce, setVieqwOnce] = useState(false)
  const [maxAccessCount, setMaxAccessCount] = useState("1")
  // const [password, setPassword] = useState("")

  const [email, setEmail] = useState("")
  const [emails, setEmails] = useState<string[]>([])

  const [quickSharesInfo, setQuickSharesInfo] = useState({
    id: "",
    accessId: "",
    requireOtp: false,
    expirationDate: 0,
    key: null,
  })

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

  const shareItem = async () => {
    try {
      setIsSharing(true)
      const type_ = cipher.type
      if ([7, 9, 10, 11, 12, 14, 15, 16].includes(type_)) {
        cipher.type = CipherType.SecureNote
        cipher.secureNote.type = 0
      }

      const send = new Send()

      // @ts-ignore
      send.cipher = cipherView
      send.cipherId = cipher.id
      send.password = ""
      send.maxAccessCount = countAccess ? parseInt(maxAccessCount ? maxAccessCount : "1") : null
      send.expirationDate = expireAfter ? new Date(Date.now() + expireAfter * 1000) : null
      send.requireOtp = !!requireOtp
      send.emails = requireOtp ? emails : []
      send.eachEmailAccessCount = !!requireOtp && viewOnce ? 1 : null

      const sendView = new SendView(send)

      // TODO: have to put cipherView directly here
      // @ts-ignore
      sendView.cipher = cipher
      const sendEnc = await sendService.encrypt(sendView)
      const sendRequest = new SendRequest(sendEnc)
      sendRequest.cipher.type = type_
      cipher.type = type_

      // Send api
      const res = await cipherStore.quickShare(sendRequest)
      if (res.kind === "ok") {
        setQuickSharesInfo({
          id: res.data.id,
          accessId: res.data.access_id,
          requireOtp: sendRequest.require_otp,
          expirationDate: sendRequest.expiration_date * 1000,
          key: sendView.key,
        })
        setPage(1)
        scrollViewRef.current?.scrollToEnd({
          animated: true,
        })
      } else {
        notifyApiError(res)
      }
    } catch (e) {
      console.log(e)
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareUrl = () => {
    console.log(
      cipherStore.getPublicShareUrl(
        quickSharesInfo.accessId,
        Utils.fromBufferToUrlB64(quickSharesInfo.key),
      ),
    )
    copyToClipboard(
      cipherStore.getPublicShareUrl(
        quickSharesInfo.accessId,
        Utils.fromBufferToUrlB64(quickSharesInfo.key),
      ),
    )
  }
  return (
    <Screen
      preset="scroll"
      safeAreaEdges={["top", "bottom"]}
      header={
        <Header
          leftText={translate("common.cancel")}
          onLeftPress={() => navigation.goBack()}
          title={translate("quick_shares.title")}
        />
      }
      footer={
        <Button
          isLoading={isSharing}
          text={
            page === 0 ? translate("quick_shares.get_link") : translate("quick_shares.copy_link")
          }
          style={{
            marginHorizontal: 16,
          }}
          onPress={page === 0 ? shareItem : copyShareUrl}
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

      <Animated.ScrollView
        // scrollEnabled={false}
        horizontal
        pagingEnabled
        ref={scrollViewRef}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        decelerationRate="fast"
        scrollEventThrottle={0}
      >
        <QuickShareConfig
          requireOtp={requireOtp}
          setRequireOtp={setRequireOtp}
          email={email}
          setEmail={setEmail}
          addEmail={addEmail}
          emails={emails}
          countAccess={countAccess}
          setCountAccess={setCountAccess}
          removeEmail={removeEmail}
          expireAfter={expireAfter}
          maxAccessCount={maxAccessCount}
          setMaxAccessCount={setMaxAccessCount}
          setExpireAfter={setExpireAfter}
        />
        <QuickSharesInfo emails={emails} {...quickSharesInfo} />
      </Animated.ScrollView>
    </Screen>
  )
})

interface QuickShareOptionProps {
  isAnyone: boolean
  isSelect: boolean
  action: () => void
  text: string
  iconColor: string
}

const QuickShareOption = ({ isAnyone, isSelect, action, text, iconColor }: QuickShareOptionProps) => {
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
      <Icon icon={isAnyone ? "global" : "user"} size={24} color={iconColor} style={{ marginHorizontal: 12 }} />
      <Text preset="black" text={text}  />
    </TouchableOpacity>
  )
}

interface QuickShareConfigProps {
  requireOtp: boolean
  setRequireOtp: (val: boolean) => void
  email: string
  setEmail: (val: string) => void
  addEmail: () => void
  emails: string[]
  countAccess: boolean
  setCountAccess: (val: boolean) => void
  removeEmail: (val: string) => void
  expireAfter: number
  maxAccessCount: string
  setMaxAccessCount: (val: string) => void
  setExpireAfter: (val: number) => void
}

const QuickShareConfig = ({
  requireOtp,
  setRequireOtp,
  email,
  setEmail,
  addEmail,
  emails,
  countAccess,
  setCountAccess,
  removeEmail,
  expireAfter,
  maxAccessCount,
  setMaxAccessCount,
  setExpireAfter,
}: QuickShareConfigProps) => {
  const { color, translate } = useMixins()
  const [openExpireSelect, setOpenExpireSelect] = useState(false)
  const [openAccessSelect, setOpenAccessSelect] = useState(false)
  const inputRef = useRef(null)

  const ExpireData = [
    {
      label: translate("quick_shares.config.expired.1h"),
      val: 60 * 60 * 1,
    },
    {
      label: translate("quick_shares.config.expired.24h"),
      val: 60 * 60 * 24,
    },
    {
      label: translate("quick_shares.config.expired.7d"),
      val: 60 * 60 * 24 * 7,
    },
    {
      label: translate("quick_shares.config.expired.14d"),
      val: 60 * 60 * 24 * 14,
    },
    {
      label: translate("quick_shares.config.expired.30d"),
      val: 60 * 60 * 24 * 30,
    },
    {
      label: translate("quick_shares.config.expired.no_expired"),
      val: null,
    },
  ]

  const AccessCountOptions = [
    {
      label: translate("quick_shares.config.access_options.unlimited"),
      value: false,
    },
    {
      label: translate("quick_shares.config.access_options.time"),
      value: true,
    },
  ]
  return (
    <View
      style={{
        width: width - 32,
      }}
    >
      <Text
        preset="semibold"
        text={translate("quick_shares.config.title")}
        style={{
          marginTop: 24,
          marginBottom: 4,
        }}
      />

      <QuickShareOption
        isAnyone
        isSelect={!requireOtp}
        action={() => {
          setRequireOtp(false)
        }}
        text={translate("quick_shares.config.anyone")}
        iconColor={color.textBlack}
      />
      <QuickShareOption
        isAnyone={false}
        isSelect={requireOtp}
        action={() => {
          setRequireOtp(true)
        }}
        text={translate("quick_shares.config.invited")}
        iconColor={color.textBlack}
      />

      {requireOtp && (
        <View
          style={{
            marginTop: 16,
          }}
        >
          <Text
            preset="semibold"
            text={translate("quick_shares.config.email")}
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
              text={translate("common.add")}
              style={{
                width: 60,
                height: 20,
                paddingHorizontal: 0,
              }}
              onPress={addEmail}
            />
          </View>
          <Text
            text={translate("quick_shares.config.verify")}
            style={{
              marginTop: 12,
              marginBottom: 12,
            }}
          />
        </View>
      )}

      {requireOtp &&
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

      <Text
        preset="semibold"
        text={translate("quick_shares.config.expired.tl")}
        style={{ marginVertical: 12 }}
      />

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
        <Text preset="black" text={ExpireData.find((e) => e.val === expireAfter).label} />
      </TouchableOpacity>

      <Text text="or" style={{ marginVertical: 12 }} />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderRadius: 8,
            borderColor: color.line,
            padding: 12,
            marginBottom: 12,
            marginRight: 16,
          }}
          onPress={() => {
            setOpenAccessSelect(true)
          }}
        >
          <Text
            preset="black"
            text={AccessCountOptions.find((e) => e.value === countAccess).label}
          />
        </TouchableOpacity>

        {countAccess && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderRadius: 8,
              borderColor: color.line,
              padding: 12,
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
            onTouchStart={() => {
              inputRef?.current?.focus()
            }}
          >
            <TextInput
              ref={inputRef}
              keyboardType="number-pad"
              value={maxAccessCount.toString()}
              onChangeText={(value) => {
                setMaxAccessCount(value.replace(/[^0-9]/g, ""))
              }}
              onBlur={() => {
                if (!maxAccessCount || maxAccessCount === "0") setMaxAccessCount("1")
              }}
              maxLength={8}
            />
          </View>
        )}
      </View>

      <ActionSheet
        isOpen={openExpireSelect}
        onClose={() => setOpenExpireSelect(false)}
        style={{ paddingHorizontal: 16 }}
      >
        <Text
          preset="bold"
          text={translate("quick_shares.config.expired.tl")}
          style={{ fontSize: 20 }}
        />
        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          {ExpireData.map((e) => (
            <TouchableOpacity key={e.label} onPress={() => setExpireAfter(e.val)}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  preset="black"
                  text={e.label}
                  style={{
                    marginVertical: 14,
                    marginBottom: 2,
                  }}
                />
                {expireAfter === e.val && <Icon icon="check" />}
              </View>
              <Divider style={{ marginTop: 10 }} />
            </TouchableOpacity>
          ))}
        </ActionSheetContent>
      </ActionSheet>

      <ActionSheet
        isOpen={openAccessSelect}
        onClose={() => setOpenAccessSelect(false)}
        style={{ paddingHorizontal: 16 }}
      >
        <Text
          preset="bold"
          text={translate("quick_shares.config.expired.tl")}
          style={{ fontSize: 20 }}
        />
        <Divider style={{ marginTop: 10 }} />
        <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
          {AccessCountOptions.map((a) => (
            <TouchableOpacity
              key={a.label}
              onPress={() => {
                setCountAccess(a.value)
                setOpenAccessSelect(false)
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  preset="black"
                  text={a.label}
                  style={{
                    marginVertical: 14,
                    marginBottom: 2,
                  }}
                />
                {countAccess === a.value && <Icon icon="check" />}
              </View>
              <Divider style={{ marginTop: 10 }} />
            </TouchableOpacity>
          ))}
        </ActionSheetContent>
      </ActionSheet>
    </View>
  )
}

interface QuickSharesInfoProps {
  // id: string
  // accessId: string
  emails: string[]
  requireOtp: boolean
  expirationDate: number
  // key: SymmetricCryptoKey
}

const QuickSharesInfo = ({
  // id,
  emails,
  requireOtp,
  expirationDate,
}: QuickSharesInfoProps) => {
  const { color, translate } = useMixins()
  const expried = moment.unix(expirationDate / 1000).format("Do MMM YYYY, h:mm:ss A")
  return (
    <View
      style={{
        width: width - 32,
      }}
    >
      <Text
        text={translate("quick_shares.receiver")}
        style={{
          marginTop: 24,
          marginBottom: 14,
        }}
      />
      <View
        style={{
          padding: 12,
          backgroundColor: color.block,
          borderRadius: 8,
        }}
      >
        {emails.map((e) => (
          <Text preset="black" text={e} />
        ))}
        {emails?.length === 0 && <Text preset="black" text={"Anyone"} />}
      </View>

      <Text
        text={translate("quick_shares.expired", { time: expried })}
        style={{
          marginTop: 26,
        }}
      />
    </View>
  )
}
