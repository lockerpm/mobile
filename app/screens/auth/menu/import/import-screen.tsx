import React, { useState } from 'react'
import { View } from 'react-native'
import { Layout, Header } from '../../../../components'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '../../../../theme'
import { useMixins } from '../../../../services/mixins'
import { useCoreService } from '../../../../services/coreService'
import RNFS from 'react-native-fs'
import { CipherType } from '../../../../../core/enums'
import { Utils } from '../../../../../core/misc/utils'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../../../models'
import { useCipherDataMixins } from '../../../../services/mixins/cipher/data'
import { Logger } from '../../../../utils/utils'
import { ImportResult } from './import-result'
import { ImportProgress } from './import-progress'
import { ImportPickFile } from './import-pick-file'
import JSZip from 'jszip'

const DOMParser = require('react-native-html-parser').DOMParser

export interface FileData {
  name: string
  uri: string
  type: string
  size: number
}

export const ImportScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, notify, color } = useMixins()
  const { importCiphers } = useCipherDataMixins()
  const { importService } = useCoreService()
  const { user } = useStores()

  // -------------------- PARAMS --------------------

  const isFreeAccount = user.isFreePlan
  const fileData = {
    name: '',
    uri: '',
    type: '',
    size: 0,
  }

  const [step, setStep] = useState(0)
  const [format, setFormat] = useState('lockerjson')
  const [file, setFile] = useState<FileData>(fileData)
  const [importedCount, setImportedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLimited, setIsLimited] = useState(false)

  // -------------------- COMPUTED --------------------

  // -------------------- METHODS --------------------

  const handleImport = async () => {
    setStep(1)

    try {
      const importer = importService.getImporter(format)

      let content: string

      if (format === '1password1pux') {
        const b64 = await RNFS.readFile(file.uri, 'base64')
        content = await extract1PuxContent(b64)
      } else {
        content = await RNFS.readFile(file.uri)
      }

      if (format === 'lastpasscsv' && file.type === 'text/html') {
        const parser = new DOMParser()
        const doc = parser.parseFromString(content, 'text/html')
        const pre = doc.querySelector('pre')
        if (pre != null) {
          content = pre.textContent
        } else {
          notify('error', translate('import.invalid_data_format'))
          setFile(fileData)
          // uiStore.setIsImporting(false)
          return
        }
      }
      let importResult
      try {
        importResult = await importer.parse(content)
      } catch (e) {
        notify('error', translate('import.invalid_data_format'))
        setFile(fileData)
        setStep(0)
        return
      }
      if (importResult.success) {
        if (importResult.folders.length === 0 && importResult.ciphers.length === 0) {
          notify('error', translate('import.no_data'))
          setFile(fileData)
          setStep(0)
          return
        } else if (importResult.ciphers.length > 0) {
          const halfway = Math.floor(importResult.ciphers.length / 2)
          const last = importResult.ciphers.length - 1
          if (
            badData(importResult.ciphers[0]) &&
            badData(importResult.ciphers[halfway]) &&
            badData(importResult.ciphers[last])
          ) {
            notify('error', translate('import.invalid_data_format'))
            setFile(fileData)
            setStep(0)
            return
          }
        }
        try {
          await importCiphers({
            importResult,
            setImportedCount,
            setTotalCount,
            setIsLimited,
            isFreeAccount,
          })
          setFile(fileData)
          setStep(2)
          return
        } catch (error) {
          notify('error', translate('import.invalid_data_format'))
        }
      } else {
        notify('error', translate('import.invalid_data_format'))
      }
    } catch (e) {
      Logger.error('Handle import: ' + e)
      notify('error', translate('error.something_went_wrong'))
    }
  }

  const badData = (c) => {
    return (
      (c.name == null || c.name === '--') &&
      c.type === CipherType.Login &&
      c.login != null &&
      Utils.isNullOrWhitespace(c.login.password)
    )
  }

  // 1pux
  const extract1PuxContent = (fileContent: string): Promise<string> => {
    return new JSZip()
      .loadAsync(fileContent, { base64: true })
      .then((zip) => {
        return zip.file('export.data').async('string')
      })
      .then(
        function success(content) {
          return content
        },
        function error(e) {
          return ''
        }
      )
  }

  // -------------------- EFFECT --------------------

  // -------------------- RENDER --------------------

  return (
    <Layout
      header={
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.import')}
          right={<View style={{ width: 30 }} />}
        />
      }
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View
        style={[
          commonStyles.GRAY_SCREEN_SECTION,
          {
            backgroundColor: color.background,
            paddingVertical: 20,
          },
        ]}
      >
        {step === 0 && (
          <ImportPickFile
            format={format}
            setFormat={setFormat}
            file={file}
            setFile={setFile}
            handleImport={handleImport}
          />
        )}
        {step === 1 && (
          <ImportProgress imported={importedCount} total={totalCount} file={file.name} />
        )}

        {step === 2 && (
          <ImportResult
            imported={importedCount}
            total={totalCount}
            isLimited={isLimited}
            setIsLimited={setIsLimited}
          />
        )}
      </View>
    </Layout>
  )
})
