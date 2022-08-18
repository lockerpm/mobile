import React, { useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { BackHandler, View } from 'react-native'
import {
  AutoImage as Image,
  Text,
  Layout,
  Button,
  Header,
  FloatingInput,
  CipherOthersInfo,
  PasswordStrength,
  CustomFieldsEdit,
  PasswordPolicyViolationsModal,
} from '../../../../../components'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { commonStyles, fontSize } from '../../../../../theme'
import { PrimaryParamList } from '../../../../../navigators/main-navigator'
import { BROWSE_ITEMS } from '../../../../../common/mappings'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from '../../../../../services/mixins'
import { useStores } from '../../../../../models'
import { CipherType } from '../../../../../../core/enums'
import { CipherView, FieldView, LoginUriView, LoginView } from '../../../../../../core/models/view'
import { useCipherDataMixins } from '../../../../../services/mixins/cipher/data'
import { useCipherHelpersMixins } from '../../../../../services/mixins/cipher/helpers'
import { PasswordPolicy } from '../../../../../config/types/api'
import { PolicyType } from '../../../../../config/types'

type PasswordEditScreenProp = RouteProp<PrimaryParamList, 'passwords__edit'>

export const PasswordEditScreen = observer(() => {
  const navigation = useNavigation()
  const route = useRoute<PasswordEditScreenProp>()
  const { mode, initialUrl } = route.params
  const { translate, color, notifyApiError } = useMixins()
  const { createCipher, updateCipher } = useCipherDataMixins()
  const { getPasswordStrength, newCipher } = useCipherHelpersMixins()
  const { cipherStore, uiStore, user } = useStores()
  const selectedCipher: CipherView = cipherStore.cipherView
  const onSaveFillService = uiStore.isOnSaveLogin

  // ----------------- PARAMS ------------------

  const [isLoading, setIsLoading] = useState(false)
  const [showViolationModal, setShowViolationModal] = useState(false)
  const [policy, setPolicy] = useState<PasswordPolicy>(null)
  const [violations, setViolations] = useState<string[]>([])
  const [pendingPayload, setPendingPayload] = useState<{
    item: CipherView
    strength: number
  }>(null)

  // Forms
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [folder, setFolder] = useState(null)
  const [organizationId, setOrganizationId] = useState(null)
  const [collectionIds, setCollectionIds] = useState([])
  const [fields, setFields] = useState<FieldView[]>([])

  // ----------------- EFFECTS ------------------

  // Mounted
  useEffect(() => {
    if (!uiStore.isOffline && user.teams.length) {
      getPolicy(user.teams[0].id)
    }
  }, [])

  // Set initial data
  useEffect(() => {
    if (mode !== 'add') {
      setName(selectedCipher.name)
      setUsername(selectedCipher.login.username)
      setPassword(selectedCipher.login.password)
      setUrl(selectedCipher.login.uri)
      setNote(selectedCipher.notes)
      setFolder(selectedCipher.folderId)
      setOrganizationId(mode === 'clone' ? null : selectedCipher.organizationId)
      setCollectionIds(selectedCipher.collectionIds)
      setFields(selectedCipher.fields || [])
    } else {
      setUrl(initialUrl || 'https://')
    }
  }, [])

  // Set initial data if open from autofill
  useEffect(() => {
    if (onSaveFillService) {
      const saveData = uiStore.saveLogin
      setUsername(saveData.username)
      setPassword(saveData.password)
      setUrl(saveData.domain)
    }
  }, [])

  // Set generated password/folder from generator
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (cipherStore.generatedPassword) {
        setPassword(cipherStore.generatedPassword)
        cipherStore.setGeneratedPassword('')
      }

      if (cipherStore.selectedFolder) {
        if (cipherStore.selectedFolder === 'unassigned') {
          setFolder(null)
        } else {
          setFolder(cipherStore.selectedFolder)
        }
        cipherStore.setSelectedFolder(null)
      }
    })

    return unsubscribe
  }, [navigation])

  // ----------------- METHODS ------------------

  // Go back
  const handleBack = () => {
    if (onSaveFillService) {
      uiStore.setIsOnSaveLogin(false)
      BackHandler.exitApp()
    } else {
      navigation.goBack()
    }
  }

  // Get policy
  const getPolicy = async (organizationId: string) => {
    setIsLoading(true)
    const res = await user.getTeamPolicy(organizationId, PolicyType.PASSWORD_REQ)
    if (res.kind === 'ok') {
      setPolicy(res.data as PasswordPolicy)
    } else {
      notifyApiError(res)
      setPolicy(null)
    }
    setIsLoading(false)
  }

  // Check policy
  const checkPolicy = (cipher: CipherView) => {
    const res = []
    if (policy && policy.enabled) {
      if (policy.config.min_length && cipher.login.password.length < policy.config.min_length) {
        res.push(translate('policy.min_password_length', { length: policy.config.min_length }))
      }
      if (policy.config.require_special_character) {
        const reg = /(?=.*[!@#$%^&*])/
        const check = reg.test(cipher.login.password)
        if (!check) {
          res.push(translate('policy.requires_special'))
        }
      }
      if (policy.config.require_lower_case) {
        const reg = /[a-z]/
        const check = reg.test(cipher.login.password)
        if (!check) {
          res.push(translate('policy.requires_lowercase'))
        }
      }
      if (policy.config.require_upper_case) {
        const reg = /[A-Z]/
        const check = reg.test(cipher.login.password)
        if (!check) {
          res.push(translate('policy.requires_uppercase'))
        }
      }
      if (policy.config.require_digit) {
        const reg = /[1-9]/
        const check = reg.test(cipher.login.password)
        if (!check) {
          res.push(translate('policy.requires_number'))
        }
      }
    }
    return res
  }

  // Prepare to save password
  const preparePassword = async () => {
    let payload: CipherView
    if (mode === 'add') {
      payload = newCipher(CipherType.Login)
    } else {
      // @ts-ignore
      payload = { ...selectedCipher }
    }

    const data = new LoginView()
    data.username = username
    data.password = password
    if (url) {
      const uriView = new LoginUriView()
      uriView.uri = url
      data.uris = [uriView]
    }

    payload.fields = fields
    payload.name = name
    payload.notes = note
    payload.folderId = folder
    payload.login = data
    payload.organizationId = organizationId
    const passwordStrength = getPasswordStrength(password).score

    // Violate team's policy
    const violatedItems = checkPolicy(payload)
    if (violatedItems.length) {
      setPendingPayload({
        item: payload,
        strength: passwordStrength,
      })
      setViolations(violatedItems)
      setShowViolationModal(true)
      return
    }

    // Ok
    handleSave(payload, passwordStrength)
  }

  // Save password
  const handleSave = async (payload: CipherView, passwordStrength: number) => {
    setIsLoading(true)
    let res = { kind: 'unknown' }
    if (['add', 'clone'].includes(mode)) {
      res = await createCipher(payload, passwordStrength, collectionIds)
    } else {
      res = await updateCipher(payload.id, payload, passwordStrength, collectionIds)
    }
    setIsLoading(false)
    if (res.kind === 'ok') {
      handleBack()
    }
  }

  // ----------------- RENDER ------------------

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
            mode === 'add'
              ? `${translate('common.add')} ${translate('common.password')}`
              : translate('common.edit')
          }
          goBack={() => {
            handleBack()
          }}
          goBackText={translate('common.cancel')}
          right={
            <Button
              isDisabled={isLoading || !name.trim()}
              preset="link"
              text={translate('common.save')}
              onPress={preparePassword}
              style={{
                height: 35,
                alignItems: 'center',
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
          <Image
            source={BROWSE_ITEMS.password.icon}
            style={{ height: 40, width: 40, marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <FloatingInput
              isRequired
              label={translate('common.item_name')}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>
      </View>
      {/* Name end */}

      <View style={commonStyles.SECTION_PADDING}>
        <Text
          text={translate('password.login_details').toUpperCase()}
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
        {/* Username */}
        <View style={{ flex: 1 }}>
          <FloatingInput
            label={translate('password.username')}
            value={username}
            onChangeText={setUsername}
          />
        </View>
        {/* Username end */}

        {/* Password */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            isPassword
            label={translate('common.password')}
            value={password}
            onChangeText={setPassword}
          />

          {!!password && (
            <PasswordStrength
              value={getPasswordStrength(password).score}
              style={{ marginTop: 15 }}
            />
          )}
        </View>
        {/* Password end */}

        {/* Generate password */}
        <Button
          preset="link"
          onPress={() => navigation.navigate('passwordGenerator')}
          style={{
            marginTop: 20,
          }}
        >
          <View
            style={[
              commonStyles.CENTER_HORIZONTAL_VIEW,
              {
                justifyContent: 'space-between',
                width: '100%',
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <FontAwesomeIcon name="repeat" size={18} color={color.primary} />
              <Text
                preset="green"
                text={translate('common.generate')}
                style={{ fontSize: fontSize.small, marginLeft: 7 }}
              />
            </View>
            <FontAwesomeIcon name="angle-right" size={20} color={color.text} />
          </View>
        </Button>
        {/* Generate password end */}

        {/* Web url */}
        <View style={{ flex: 1, marginTop: 20 }}>
          <FloatingInput
            label={translate('password.website_url')}
            value={url}
            onChangeText={setUrl}
          />
        </View>
        {/* Web url end */}
      </View>
      {/* Info end */}

      {/* Custom fields */}
      <CustomFieldsEdit fields={fields} setFields={setFields} />
      {/* Custom fields end */}

      {/* Others */}
      <CipherOthersInfo
        navigation={navigation}
        hasNote
        note={note}
        onChangeNote={setNote}
        folderId={folder}
        organizationId={organizationId}
        setOrganizationId={setOrganizationId}
        collectionIds={collectionIds}
        setCollectionIds={setCollectionIds}
        isDeleted={selectedCipher.isDeleted}
      />
      {/* Others end */}

      {/* Violations modal */}
      <PasswordPolicyViolationsModal
        isOpen={showViolationModal}
        onClose={() => {
          setShowViolationModal(false)
        }}
        violations={violations}
        teamName={user.teams[0]?.name}
        onConfirm={() => {
          setShowViolationModal(false)
          handleSave(pendingPayload.item, pendingPayload.strength)
        }}
      />
      {/* Violations modal end */}
    </Layout>
  )
})
