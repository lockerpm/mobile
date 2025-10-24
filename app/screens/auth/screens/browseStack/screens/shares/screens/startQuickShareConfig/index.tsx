import { observer } from "mobx-react-lite"
import { FC, useEffect, useRef, useState } from "react"
import { Dimensions, View, StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { useCoreService } from "app/services/coreService"
import { useStores } from "app/models"
import { CipherType } from "core/enums"
import { Send } from "core/models/domain/send"
import { SendView } from "core/models/view/sendView"
import { SendRequest } from "core/models/request/sendRequest"
import { Button, Header, Screen, Text } from "app/components/cores"
import { useClipboard, useToast } from "app/services/utils"
import { getCipherDescription } from "app/utils/cipherHelper"
import { CipherIconImage } from "app/components/ciphers"
import { ShareScreenProps } from "@/navigators"
import { Base64 } from "@/utils/base64"
import { Logger } from "@/utils/logger"
import { QuickSharesInfo } from "./QuickShareInfo"
import { QuickShareConfig } from "./QuickShareConfig"
import { useAppTheme } from "@/utils/useAppTheme"
import { validateEmail } from "@/utils/utils"

const { width } = Dimensions.get("screen")

export const QuickSharesScreen: FC<ShareScreenProps<"quickShares">> = observer(
  ({
    navigation,
    route: {
      params: { cipher },
    },
  }) => {
    const {
      theme: { colors },
    } = useAppTheme()
    const { notifyApiError, notifyTx } = useToast()
    const { copyToClipboard } = useClipboard()
    const { sendService } = useCoreService()
    const { cipherStore } = useStores()

    // --------------------COMPUTED-----------------------------

    // --------------------PARAMS-----------------------------
    const scrollViewRef = useRef<Animated.ScrollView>(null)
    const [page, setPage] = useState<0 | 1>(0)
    const [isSharing, setIsSharing] = useState(false)

    const [requireOtp, setRequireOtp] = useState(false)

    const [expireAfter, setExpireAfter] = useState<null | number>(60 * 60 * 24)

    const [countAccess, setCountAccess] = useState(false)
    const [maxAccessCount, setMaxAccessCount] = useState("1")

    const [email, setEmail] = useState("")
    const [emails, setEmails] = useState<string[]>([])

    const [quickSharesInfo, setQuickSharesInfo] = useState({
      id: "",
      accessId: "",
      requireOtp: false,
      expirationDate: 0,
      key: new ArrayBuffer(),
    })

    const addEmail = () => {
      const e = email.trim().toLowerCase()
      const isValidate = validateEmail(e)
      if (!isValidate) {
        notifyTx("error", "error:email_validate")
        return
      }
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
        send.cipher = cipher
        send.cipherId = cipher.id
        send.password = ""
        send.maxAccessCount = countAccess ? parseInt(maxAccessCount || "1") : undefined
        // @ts-ignore
        send.expirationDate = expireAfter ? new Date(Date.now() + expireAfter * 1000) : null
        send.requireOtp = requireOtp
        send.emails = requireOtp ? emails : []
        send.eachEmailAccessCount = undefined

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
            expirationDate: (sendRequest.expiration_date ?? 0) * 1000,
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
        Logger.error(e)
      } finally {
        setIsSharing(false)
      }
    }

    const copyShareUrl = () => {
      copyToClipboard(
        cipherStore.getPublicShareUrl(
          quickSharesInfo.accessId,
          Base64.bufferToBase64url(quickSharesInfo.key)
        )
      )
    }

    useEffect(() => {
      if (!requireOtp) {
        setEmails([])
      }
    }, [requireOtp])

    return (
      <Screen
        disableAvoidkeyboard
        preset="scroll"
        safeAreaEdges={["bottom"]}
        header={
          <Header
            leftIcon="arrow-left"
            onLeftPress={navigation.goBack}
            titleTx="quick_shares:title"
          />
        }
        footer={
          <View>
            <Button
              disabled={page === 0 && requireOtp ? emails.length === 0 : false}
              loading={isSharing}
              tx={page === 0 ? "quick_shares:get_link" : "quick_shares:copy_link"}
              style={styles.mh16}
              onPress={page === 0 ? shareItem : copyShareUrl}
            />
            {page === 1 && (
              <Button
                tx="common:done"
                preset="secondary"
                style={[styles.mh16, styles.mt16]}
                onPress={navigation.goBack}
              />
            )}
          </View>
        }
        contentContainerStyle={styles.p16}
      >
        <View style={[styles.row, { borderColor: colors.border }]}>
          <CipherIconImage
            isHaveKey={cipher.login.hasFido2Credentials}
            cipherType={cipher.type}
            source={cipher.imgLogo}
          />

          <View style={styles.name}>
            <Text preset="bold" numberOfLines={1} text={cipher.name} />
            {!!getCipherDescription(cipher) && (
              <Text text={getCipherDescription(cipher)} size="sm" numberOfLines={1} />
            )}
          </View>
        </View>

        <Animated.ScrollView
          scrollEnabled={false}
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
          <QuickSharesInfo emails={emails} expirationDate={quickSharesInfo.expirationDate} />
        </Animated.ScrollView>
      </Screen>
    )
  }
)

const styles = StyleSheet.create({
  mh16: {
    marginHorizontal: 16,
  },
  mt16: {
    marginTop: 16,
  },
  name: {
    flexGrow: 1,
    flexShrink: 1,
    marginLeft: 12,
  },
  p16: {
    paddingHorizontal: 16,
  },
  row: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
})
