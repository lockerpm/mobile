import { observer } from 'mobx-react-lite'
import React, { FC, useRef, useState } from 'react'
import { Dimensions, TextInput, TouchableOpacity, View, Image } from 'react-native'
import Animated from 'react-native-reanimated'
import moment from 'moment'
import { AppStackScreenProps } from 'app/navigators'
import { useCipherHelper, useHelper } from 'app/services/hook'
import { useCoreService } from 'app/services/coreService'
import { useStores } from 'app/models'
import { CipherType } from 'core/enums'
import { Send } from 'core/models/domain/send'
import { SendView } from 'core/models/view/sendView'
import { SendRequest } from 'core/models/request/sendRequest'
import { Logger } from 'app/utils/utils'
import { Utils } from 'app/services/coreService/utils'
import { Button, Header, Icon, Screen, Text, Toggle } from 'app/components-v2/cores'
import { translate } from 'app/i18n'
import { useTheme } from 'app/services/context'
import { ActionSheet } from 'app/components-v2/ciphers'

const { width } = Dimensions.get('screen')

export const QuickSharesScreen: FC<AppStackScreenProps<'quick_shares'>> = observer((props) => {
  const { copyToClipboard, notifyApiError } = useHelper()
  const { sendService } = useCoreService()
  const { getCipherDescription, getCipherInfo } = useCipherHelper()
  const { cipherStore } = useStores()
  const route = props.route
  const navigation = props.navigation

  // --------------------COMPUTED-----------------------------
  const cipherView = route.params.cipher

  const cipherInfo = getCipherInfo(cipherView)
  const cipher = {
    ...cipherView,
    imgLogo: cipherInfo.img,
    notSync: [...cipherStore.notSynchedCiphers, ...cipherStore.notUpdatedCiphers].includes(
      cipherView.id
    ),
    isDeleted: cipherView.isDeleted,
  }

  // --------------------PARAMS-----------------------------
  const scrollViewRef = useRef(null)
  const [page, setPage] = useState<0 | 1>(0)
  const [isSharing, setIsSharing] = useState(false)

  const [requireOtp, setRequireOtp] = useState(false)

  const [expireAfter, setExpireAfter] = useState<null | number>(60 * 60 * 24)

  const [countAccess, setCountAccess] = useState(false)
  const [maxAccessCount, setMaxAccessCount] = useState('1')
  // const [password, setPassword] = useState("")

  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])

  const [quickSharesInfo, setQuickSharesInfo] = useState({
    id: '',
    accessId: '',
    requireOtp: false,
    expirationDate: 0,
    key: null,
  })

  const addEmail = () => {
    const e = email.trim().toLowerCase()
    if (!!e && !emails.includes(e)) {
      setEmails([...emails, e])
    }
    setEmail('')
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
      send.password = ''
      send.maxAccessCount = countAccess ? parseInt(maxAccessCount || '1') : null
      send.expirationDate = expireAfter ? new Date(Date.now() + expireAfter * 1000) : null
      send.requireOtp = requireOtp
      send.emails = requireOtp ? emails : []
      send.eachEmailAccessCount = requireOtp ? 1 : null

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
      if (res.kind === 'ok') {
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
      Logger.error(e)
    } finally {
      setIsSharing(false)
    }
  }

  const copyShareUrl = () => {
    copyToClipboard(
      cipherStore.getPublicShareUrl(
        quickSharesInfo.accessId,
        Utils.bufferToBase64url(quickSharesInfo.key)
      )
    )
  }
  return (
    <Screen
      preset="scroll"
      safeAreaEdges={['top', 'bottom']}
      header={
        <Header
          leftText={translate('common.cancel')}
          onLeftPress={() => navigation.goBack()}
          title={translate('quick_shares.title')}
        />
      }
      footer={
        <Button
          loading={isSharing}
          text={
            page === 0 ? translate('quick_shares.get_link') : translate('quick_shares.copy_link')
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
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={cipher.imgLogo}
          style={{
            height: 40,
            width: 40,
            borderRadius: 8,
          }}
        />

        <View style={{ flex: 1, marginLeft: 12 }}>
          {/* Name */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text preset="bold" numberOfLines={1} text={cipher.name} />
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

const QuickShareOption = ({
  isAnyone,
  isSelect,
  action,
  text,
  iconColor,
}: QuickShareOptionProps) => {
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        marginVertical: 5,
      }}
      onPress={action}
    >
      <Toggle variant="checkbox" value={isSelect} />
      <Icon
        icon={isAnyone ? 'users-three' : 'user'}
        size={24}
        color={iconColor}
        style={{ marginHorizontal: 12 }}
      />
      <Text text={text} />
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
  const { colors } = useTheme()
  const [openExpireSelect, setOpenExpireSelect] = useState(false)
  const [openAccessSelect, setOpenAccessSelect] = useState(false)
  const inputRef = useRef(null)

  const ExpireData = [
    {
      label: translate('quick_shares.config.expired.1h'),
      val: 60 * 60 * 1,
    },
    {
      label: translate('quick_shares.config.expired.24h'),
      val: 60 * 60 * 24,
    },
    {
      label: translate('quick_shares.config.expired.7d'),
      val: 60 * 60 * 24 * 7,
    },
    {
      label: translate('quick_shares.config.expired.14d'),
      val: 60 * 60 * 24 * 14,
    },
    {
      label: translate('quick_shares.config.expired.30d'),
      val: 60 * 60 * 24 * 30,
    },
    {
      label: translate('quick_shares.config.expired.no_expired'),
      val: null,
    },
  ]

  const AccessCountOptions = [
    {
      label: translate('quick_shares.config.access_options.unlimited'),
      value: false,
    },
    {
      label: translate('quick_shares.config.access_options.time'),
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
        preset="bold"
        text={translate('quick_shares.config.title')}
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
        text={translate('quick_shares.config.anyone')}
        iconColor={colors.title}
      />
      <QuickShareOption
        isAnyone={false}
        isSelect={requireOtp}
        action={() => {
          setRequireOtp(true)
        }}
        text={translate('quick_shares.config.invited')}
        iconColor={colors.title}
      />

      {requireOtp && (
        <View
          style={{
            marginTop: 16,
          }}
        >
          <Text
            preset="bold"
            text={translate('quick_shares.config.email')}
            style={{
              marginBottom: 12,
            }}
          />
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderRadius: 8,
              borderColor: colors.border,
              padding: 2,
              paddingLeft: 12,
            }}
          >
            <TextInput
              placeholder={translate('shares.share_folder.add_email')}
              placeholderTextColor={colors.title}
              selectionColor={colors.primary}
              onChangeText={setEmail}
              value={email}
              clearButtonMode="unless-editing"
              clearTextOnFocus={true}
              onSubmitEditing={addEmail}
              style={{
                color: colors.title,
                flex: 1,
              }}
            />

            <Button
              disabled={!email}
              text={translate('common.add')}
              style={{
                width: 60,
                height: 20,
                paddingHorizontal: 0,
              }}
              onPress={addEmail}
            />
          </View>
          <Text
            text={translate('quick_shares.config.verify')}
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
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginVertical: 8,
              }}
            >
              <Text text={e} />
              <Icon icon="trash" onPress={() => removeEmail(e)} />
            </View>
          )
        })}

      <Text
        preset="bold"
        text={translate('quick_shares.config.expired.tl')}
        style={{ marginVertical: 12 }}
      />

      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderRadius: 8,
          borderColor: colors.border,
          padding: 12,
        }}
        onPress={() => {
          setOpenExpireSelect(true)
        }}
      >
        <Text text={ExpireData.find((e) => e.val === expireAfter).label} />
      </TouchableOpacity>

      <Text text={translate('quick_shares.config.or')} style={{ marginVertical: 12 }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: colors.border,
            padding: 12,
            marginBottom: 12,
            marginRight: 16,
          }}
          onPress={() => {
            setOpenAccessSelect(true)
          }}
        >
          <Text text={AccessCountOptions.find((e) => e.value === countAccess).label} />
        </TouchableOpacity>

        {countAccess && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderRadius: 8,
              borderColor: colors.border,
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
                setMaxAccessCount(value.replace(/[^0-9]/g, ''))
              }}
              onBlur={() => {
                if (!maxAccessCount || maxAccessCount === '0') setMaxAccessCount('1')
              }}
              maxLength={8}
            />
          </View>
        )}
      </View>

      <ActionSheet
        isOpen={openExpireSelect}
        onClose={() => setOpenExpireSelect(false)}
        header={
          <Text
            preset="bold"
            text={translate('quick_shares.config.expired.tl')}
            style={{ fontSize: 20 }}
          />
        }
      >
        {ExpireData.map((e) => (
          <TouchableOpacity
            key={e.label}
            onPress={() => {
              setOpenExpireSelect(false)
              setExpireAfter(e.val)
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                text={e.label}
                style={{
                  marginVertical: 14,
                  marginBottom: 2,
                }}
              />
              {expireAfter === e.val && <Icon icon="check" />}
            </View>
          </TouchableOpacity>
        ))}
      </ActionSheet>

      <ActionSheet
        isOpen={openAccessSelect}
        onClose={() => setOpenAccessSelect(false)}
        header={
          <Text
            preset="bold"
            text={translate('quick_shares.config.expired.tl')}
            style={{ fontSize: 20 }}
          />
        }
      >
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
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                text={a.label}
                style={{
                  marginVertical: 14,
                  marginBottom: 2,
                }}
              />
              {countAccess === a.value && <Icon icon="check" />}
            </View>
          </TouchableOpacity>
        ))}
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
  expirationDate,
}: QuickSharesInfoProps) => {
  const { colors } = useTheme()
  const expried = moment.unix(expirationDate / 1000).format('Do MMM YYYY, h:mm:ss A')
  return (
    <View
      style={{
        width: width - 32,
      }}
    >
      <Text
        text={translate('quick_shares.receiver')}
        style={{
          marginTop: 24,
          marginBottom: 14,
        }}
      />
      <View
        style={{
          padding: 12,
          backgroundColor: colors.border,
          borderRadius: 8,
        }}
      >
        {emails.map((e) => (
          <Text key={e} text={e} />
        ))}
        {emails?.length === 0 && <Text text={'Anyone'} />}
      </View>

      {!!expirationDate && (
        <Text
          text={translate('quick_shares.expired', { time: expried })}
          style={{
            marginTop: 26,
          }}
        />
      )}
    </View>
  )
}
