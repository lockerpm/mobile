import React, { useState } from 'react'
import { View } from 'react-native'
import { Layout, Header } from '../../../../components'
import { useNavigation } from '@react-navigation/native'
import { commonStyles } from '../../../../theme'
import { useMixins } from '../../../../services/mixins'
import { SettingsItem } from '../settings/settings-item'
import { ConfirmPassModal } from './confirm-pass-modal'
import { useCoreService } from '../../../../services/coreService'
import { observer } from 'mobx-react-lite'

export const ExportScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, notify, color } = useMixins()
  const { platformUtilsService, exportService } = useCoreService()

  // ----------------------- PARAMS -----------------------

  const formats = [
    'csv',
    'json',
    // 'encrypted_json'
  ]
  const [isLoading, setIsLoading] = useState(false)
  const [format, setFormat] = useState('')
  const [showConfirmModal, setShowConfirmModal] = useState(false)

  // ----------------------- METHODS -----------------------

  const handleExport = async () => {
    setIsLoading(true)
    // @ts-ignore
    const data = await exportService.getExport(format)
    const isSuccess = await downloadFile(data)
    if (isSuccess) {
      notify('success', translate('export.success'))
    } else {
      notify('error', translate('error.something_went_wrong'))
    }
    setIsLoading(false)
  }

  const downloadFile = (csv) => {
    const fileName = createFileName(null)
    return platformUtilsService.saveFile(csv, 'utf8', fileName)
  }

  const createFileName = (prefix) => {
    let extension = format
    if (format === 'encrypted_json') {
      if (prefix == null) {
        prefix = 'encrypted'
      } else {
        prefix = 'encrypted_' + prefix
      }
      extension = 'json'
    }
    return getFileName(prefix, extension)
  }

  const getFileName = (prefix = null, extension = 'csv') => {
    const now = new Date()
    const dateString =
      now.getFullYear() +
      '' +
      padNumber(now.getMonth() + 1, 2) +
      '' +
      padNumber(now.getDate(), 2) +
      padNumber(now.getHours(), 2) +
      '' +
      padNumber(now.getMinutes(), 2) +
      padNumber(now.getSeconds(), 2)

    return 'cystack' + (prefix ? '_' + prefix : '') + '_export_' + dateString + '.' + extension
  }

  const padNumber = (num: number, width: number, padCharacter = '0') => {
    const numString = num.toString()
    return numString.length >= width
      ? numString
      : new Array(width - numString.length + 1).join(padCharacter) + numString
  }

  // ----------------------- EFFECT -----------------------

  // ----------------------- RENDER -----------------------

  return (
    <Layout
      isContentOverlayLoading={isLoading}
      header={
        <Header
          goBack={() => {
            navigation.goBack()
          }}
          title={translate('settings.export')}
          right={<View style={{ width: 30 }} />}
        />
      }
      containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
    >
      <ConfirmPassModal
        navigation={navigation}
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExport}
      />

      <View
        style={[
          commonStyles.GRAY_SCREEN_SECTION,
          {
            backgroundColor: color.background,
          },
        ]}
      >
        {formats.map((f, index) => (
          <SettingsItem
            key={f}
            name={f.toUpperCase()}
            action={() => {
              setFormat(f)
              setShowConfirmModal(true)
            }}
            noBorder={index === formats.length - 1}
          />
        ))}
      </View>
    </Layout>
  )
})
