import React, { useState } from "react"
import { observer } from "mobx-react-lite"
import { View } from "react-native"
import { Layout, Header, Select, Text, Button } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { color, commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { SettingsItem } from "../settings/settings-item"
import { useCoreService } from "../../../../services/core-service"
import DocumentPicker from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import { CipherType } from "../../../../../core/enums"
import { Utils } from "../../../../../core/misc/utils"
import { ImportCiphersRequest } from "../../../../../core/models/request/importCiphersRequest"
import { CipherRequest } from "../../../../../core/models/request/cipherRequest"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { KvpRequest } from "../../../../../core/models/request/kvpRequest"
import { useStores } from "../../../../models"
const DOMParser = require('react-native-html-parser').DOMParser


export const ImportScreen = observer(function ImportScreen() {
  const navigation = useNavigation()
  const { translate, notify, notifyApiError } = useMixins()
  const { importService, cipherService, folderService } = useCoreService()
  const { cipherStore } = useStores()

  // PARAMS

  const cystackOptions = [
    { name: 'CyStack (json)', id: 'cystackjson' },
    { name: 'CyStack (csv)', id: 'cystackcsv' }
  ]
  const formats = [
    ...cystackOptions,
    ...importService.featuredImportOptions,
    ...(importService.regularImportOptions || []).sort((a, b) => {
      if (a.name == null && b.name != null) {
        return -1
      }
      if (a.name != null && b.name == null) {
        return 1
      }
      if (a.name == null && b.name == null) {
        return 0
      }
      return a.name.localeCompare(b.name)
    })
  ].map(i => ({
    label: i.name,
    value: i.id
  }))
  const fileData = {
    name: '',
    uri: '',
    type: '',
    size: 0
  }

  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState('cystackjson')
  const [file, setFile] = useState(fileData)

  // METHODS

  const pickFile = async () => {
    try {
      const targetFormat = formats.find(i => i.value === format)
      const targetExtension = targetFormat.label.split(' (')[1].split(')')[0]

      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      })

      if (res.name.endsWith(`.${targetExtension}`)) {
        setFile(res)
      } else {
        notify('error', translate('import.pls_select_right_format', { format: targetExtension }))
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        __DEV__ && console.log(err)
        notify('error', translate('error.something_went_wrong'))
      }
    }
  }

  const handleImport = async () => {
    setIsLoading(true)

    try {
      const f = cystackOptions.map(e => e.id).includes(format) ? format.replace('cystack', 'bitwarden') : format
      const importer = importService.getImporter(f)
      let content = await RNFS.readFile(file.uri)

      if (format === 'lastpasscsv' && file.type === 'text/html') {
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const pre = doc.querySelector('pre')
        if (pre != null) {
          content = pre.textContent
        } else {
          notify('error', translate('import.invalid_data_format'))
          setIsLoading(false)
          return
        }
      }

      let importResult
      try {
        importResult = await importer.parse(content)
      } catch (e) {
        notify('error', translate('import.invalid_data_format'))
        setIsLoading(false)
        return
      }
      
      if (importResult.success) {
        if (importResult.folders.length === 0 && importResult.ciphers.length === 0) {
          notify('error', translate('import.no_data'))
          return
        } else if (importResult.ciphers.length > 0) {
          const halfway = Math.floor(importResult.ciphers.length / 2)
          const last = importResult.ciphers.length - 1

          if (badData(importResult.ciphers[0]) &&
            badData(importResult.ciphers[halfway]) &&
            badData(importResult.ciphers[last])
          ) {
            notify('error', translate('import.invalid_data_format'))
            return
          }
        }

        try {
          await postImport(importResult)
          return
        } catch (error) {
          notify('error', translate('import.invalid_data_format'))
        }
      } else {
        notify('error', translate('import.invalid_data_format'))
      }
    } catch(e) {
      __DEV__ && console.log(e)
      notify('error', translate('error.something_went_wrong'))
    }

    setIsLoading(false)
  }

  const badData = (c) => {
    return (c.name == null || c.name === '--') &&
      (c.type === CipherType.Login && c.login != null && Utils.isNullOrWhitespace(c.login.password))
  }

  const postImport = async (importResult) => {
    const request = new ImportCiphersRequest()
    for (let i = 0; i < importResult.ciphers.length; i++) {
      const c = await cipherService.encrypt(importResult.ciphers[i])
      request.ciphers.push(new CipherRequest(c))
    }
    if (importResult.folders != null) {
      for (let i = 0; i < importResult.folders.length; i++) {
        const f = await folderService.encrypt(importResult.folders[i])
        request.folders.push(new FolderRequest(f))
      }
    }
    if (importResult.folderRelationships != null) {
      importResult.folderRelationships.forEach(r =>
        request.folderRelationships.push(new KvpRequest(r[0], r[1])))
    }
    const res = await cipherStore.importCipher(request)
    setIsLoading(false)
    if (res.kind === 'ok') {
      notify('success', translate('import.success'))
      setFile(fileData)
      navigation.navigate('mainTab', { screen: 'homeTab' })
    } else {
      notifyApiError(res)
    }
  }

  // EFFECT

  // RENDER

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.import')}
          right={(<View style={{ width: 10 }} />)}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={commonStyles.GRAY_SCREEN_SECTION}>
        <Select
          showSearch
          value={format}
          onChange={(val: string) => setFormat(val)}
          options={formats}
          renderSelected={({ label }) => (
            <SettingsItem
              style={{ width: '100%' }}
              name={translate('import.format')}
              right={(
                <Text text={label} />
              )}
            />
          )}
        />

        <SettingsItem
          style={{ width: '100%' }}
          name={translate('import.file')}
          action={pickFile}
          right={(
            <Text
              numberOfLines={1}
              ellipsizeMode="middle"
              text={file.name}
              style={{
                maxWidth: 150
              }}
            />
          )}
        />

        <Button
          isDisabled={isLoading || !file.uri}
          text={translate('settings.import')}
          onPress={handleImport}
          style={{
            marginBottom: 30,
            marginTop: 30
          }}
        />
      </View> 
    </Layout>
  )
})
