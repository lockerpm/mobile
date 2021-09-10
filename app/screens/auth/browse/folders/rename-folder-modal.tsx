import React, { useState, useEffect } from "react"
import { Modal } from "native-base"
import { FloatingInput, Button, Text } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { useCoreService } from "../../../../services/core-service"
import { FolderView } from "../../../../../core/models/view/folderView"
import { FolderRequest } from "../../../../../core/models/request/folderRequest"
import { useMixins } from "../../../../services/mixins"
import { CollectionView } from "../../../../../core/models/view/collectionView"
import { translate } from "../../../../i18n"
import { fontSize } from "../../../../theme"

interface Props {
  isOpen?: boolean,
  onClose?: Function,
  folder: FolderView | CollectionView
}

export const RenameFolderModal = observer((props: Props) => {
  const { isOpen, onClose, folder } = props
  const { folderStore } = useStores()
  const { folderService } = useCoreService()
  const { notify } = useMixins()

  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const renameFolder = async () => {
    setIsLoading(true)
    const data = {...folder}
    let res = { kind: 'unknown' }
    data.name = name

    if (data instanceof FolderView) {
      const folderEnc = await folderService.encrypt(data)
      const payload = new FolderRequest(folderEnc)
      res = await folderStore.updateFolder(folder.id, payload)
    }

    if (res.kind === 'ok') {
      notify('success', translate('folder.folder_updated'))
      onClose()
    } else {
      notify('error', translate('error.something_went_wrong'))
    }
    setIsLoading(false)
  }

  useEffect(() => {
    setName(folder.name || '')
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
    >
      <Modal.Content>
        <Modal.CloseButton />
        <Modal.Header>
          <Text
            preset="header"
            text={translate('folder.rename_folder')}
            style={{
              fontSize: fontSize.h4
            }}
          />
        </Modal.Header>
        <Modal.Body>
          <FloatingInput
            label={translate('common.name')}
            value={name}
            onChangeText={txt => setName(txt)}
          />
        </Modal.Body>
        <Modal.Footer style={{ marginRight: 20, marginBottom: 16, paddingRight: 0 }}>
          <Button
            text={translate('common.save')}
            disabled={isLoading || !name.trim()}
            isLoading={isLoading}
            onPress={renameFolder}
            style={{
              width: '100%'
            }}
          />
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  )
})
