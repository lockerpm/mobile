import React from "react"
import { View, } from "react-native"
import { Select, Text} from "../../../../components"
import { useMixins } from "../../../../services/mixins"
import { SettingsItem } from "../settings/settings-item"
import { useCoreService } from "../../../../services/core-service"
import DocumentPicker from 'react-native-document-picker'
import { useStores } from "../../../../models"
import { Logger } from "../../../../utils/logger"
import { FileData } from "./import-screen"


interface ImportPickFileProps {
    format: string
    setFormat: Function
    file: FileData
    setFile: Function
}

export const ImportPickFile = (props: ImportPickFileProps) => {
    const { translate, notify } = useMixins()
    const { importService } = useCoreService()
    const { uiStore } = useStores()

    const {format, setFormat, file, setFile} = props

    // -------------------- COMPUTED --------------------

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

    // -------------------- METHODS --------------------

    const getFileName = (file) => {
        if (file.name) {
            return file.name
        }
        const uriComponents = file.uri.split('/')
        return uriComponents[uriComponents.length - 1]
    }

    const pickFile = async () => {
        try {
            // Mark as overlay task to prevent lock when return
            uiStore.setIsPerformOverlayTask(true)

            const targetFormat = formats.find(i => i.value === format)
            const targetExtension = targetFormat.label.split(' (')[1].split(')')[0]

            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.allFiles],
            })

            if (getFileName(res).endsWith(`.${targetExtension}`)) {
                setFile(res)
            } else {
                notify('error', translate('import.pls_select_right_format', { format: targetExtension }))
            }


        } catch (err) {
            if (DocumentPicker.isCancel(err)) {
                // User cancelled the picker, exit any dialogs or menus and move on
            } else {
                Logger.error('Import pick file: ' + err)
                notify('error', translate('error.something_went_wrong'))
            }
        }
    }


    return !uiStore.isImporting ? (<View>
        <Select
            showSearch
            value={format}
            onChange={(val: string) => setFormat(val)}
            options={formats}
            title={translate('import.format')}
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
                    text={getFileName(file)}
                    style={{
                        maxWidth: 150
                    }}
                />
            )}
        />
    </View>) : null
}