import React, { useEffect, useState } from "react"
import { View, Image } from "react-native"
import { Layout, Header, Text, Button, ActionSheet, ActionSheetContent } from "../../../../components"
import { useNavigation } from "@react-navigation/native"
import { commonStyles } from "../../../../theme"
import { useMixins } from "../../../../services/mixins"
import { useCoreService } from "../../../../services/core-service"
import RNFS from 'react-native-fs'
import { CipherType } from "../../../../../core/enums"
import { Utils } from "../../../../../core/misc/utils"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"
import { Logger } from "../../../../utils/logger"
import { PlanType } from "../../../../config/types"
import { ImportResult } from "./import-result"
import { ImportProgress } from "./import-progress"
import { ImportPickFile } from "./import-pick-file"

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
  const { uiStore, user } = useStores()

  // -------------------- PARAMS --------------------

  const isFreeAccount = user.plan?.alias === PlanType.FREE
  const fileData = {
    name: '',
    uri: '',
    type: '',
    size: 0
  }

  const [format, setFormat] = useState('cystackjson')
  const [file, setFile] = useState<FileData>(fileData)
  const [importedCount, setImportedCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [isLimited, setIsLimited] = useState(false)
  const [showImportResult, setShowImportResult] = useState(false)

  // -------------------- COMPUTED --------------------

  const cystackOptions = [
    { name: 'CyStack (json)', id: 'cystackjson' },
    { name: 'CyStack (csv)', id: 'cystackcsv' }
  ]
  // -------------------- METHODS --------------------

  const handleImport = async () => {
    uiStore.setIsImporting(true, file.name)

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
          setFile(fileData)
          uiStore.setIsImporting(false)
          return
        }
      }
      let importResult
      try {
        importResult = await importer.parse(content)
      } catch (e) {
        notify('error', translate('import.invalid_data_format'))
        setFile(fileData)
        uiStore.setIsImporting(false)
        return
      }
      if (importResult.success) {
        if (importResult.folders.length === 0 && importResult.ciphers.length === 0) {
          notify('error', translate('import.no_data'))
          setFile(fileData)
          uiStore.setIsImporting(false)
          return
        } else if (importResult.ciphers.length > 0) {
          const halfway = Math.floor(importResult.ciphers.length / 2)
          const last = importResult.ciphers.length - 1
          if (badData(importResult.ciphers[0]) &&
            badData(importResult.ciphers[halfway]) &&
            badData(importResult.ciphers[last])
          ) {
            notify('error', translate('import.invalid_data_format'))
            setFile(fileData)
            uiStore.setIsImporting(false)
            return
          }
        }
        try {
          await importCiphers(importResult, isFreeAccount)
          if (!uiStore.isImportLimited) {
            setFile(fileData)
          }
          setShowImportResult(true)
          uiStore.setIsImporting(uiStore.isImportLimited)
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
    uiStore.setIsImporting(false)
  }

  const badData = (c) => {
    return (c.name == null || c.name === '--') &&
      (c.type === CipherType.Login && c.login != null && Utils.isNullOrWhitespace(c.login.password))
  }

  // -------------------- EFFECT --------------------

  useEffect(() => {
    if (uiStore.isImporting) {
      setImportedCount(uiStore.importCipherProgress.cipher + uiStore.importFolderProgress.folder)
      setTotalCount(uiStore.importCipherProgress.totalCipher + uiStore.importFolderProgress.totalFolder)
    }
  }, [uiStore.importCipherProgress, uiStore.importFolderProgress, uiStore.isImporting])

  useEffect(() => {
    if (uiStore.isImportLimited) {
      setIsLimited(true)
    }
  }, [uiStore.isImportLimited])

  useEffect(() => {
    if (showImportResult) {
      uiStore.setIsImporting(uiStore.isImportLimited)
    }
  }, [showImportResult])

  useEffect(() => {
    return () => {
      uiStore.setIsImporting(false)
      uiStore.setIsImportLimited(false)
    }
  }, [])

  // -------------------- RENDER --------------------

  return (
    <Layout
      header={(
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.import')}
          right={<View style={{ width: 30 }} />}
        />
      )}
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <View style={[commonStyles.GRAY_SCREEN_SECTION, {
        backgroundColor: color.background,
        paddingVertical: 20
      }]}>
        {showImportResult ? <ImportResult
          imported={importedCount}
          total={totalCount}
        /> : <View>
          <ImportPickFile format={format}
            setFormat={setFormat}
            file={file}
            setFile={setFile}
          />
          <ImportProgress imported={importedCount}
            total={totalCount}
            file={file.name}
          />
          <Button
            isLoading={uiStore.isImporting}
            isDisabled={!file.uri || uiStore.isImporting}
            text={translate('settings.import')}
            onPress={handleImport}
            style={{
              marginTop: 30,
              marginBottom: 10
            }}
          />
        </View>}

        <ActionSheet
          isOpen={isLimited}
          onClose={() => {
            setIsLimited(false)
            setFile(fileData)
            uiStore.setIsImporting(false)
          }}>
          <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
            <View style={{ alignItems: "center" }}>
              <Image
                source={require("./Locker.png")}
                style={{ height: 60, width: 60 }}
              />
              <Text preset="bold" text={translate("import.limited")} style={{ marginBottom: 8 }} />
              <Text text={`${importedCount}/${totalCount} ` +  translate("import.imported_free.note")} style={{ maxWidth: "90%", textAlign: "center", marginBottom: 16 }} />

              <Button
                text="Get Unlimited"
                onPress={() => {
                  setIsLimited(false)
                  setFile(fileData)
                  uiStore.setIsImporting(false)
                  uiStore.clearImportProgress()
                  navigation.navigate('payment')
                }}
                style={{ marginBottom: 50, width: "90%" }} />
            </View>
          </ActionSheetContent>
        </ActionSheet>
      </View>
    </Layout>
  )
})
