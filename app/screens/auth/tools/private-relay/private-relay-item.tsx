import React, { useState } from 'react'
import { View } from 'react-native'
import {
  Text,
  Button,
  ActionSheet,
  Divider,
  ActionSheetContent,
  ActionItem,
} from '../../../../components'
import { commonStyles } from '../../../../theme'
import { useMixins } from '../../../../services/mixins'
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import moment from 'moment'
import { useStores } from '../../../../models'
import { RelayAddress } from '../../../../config/types/api'

interface Props {
  isFreeAccount: boolean
  navigation: any
  item: RelayAddress
  index: number
  deleteRelayAddress: (id: number) => void
  setShowEditModal: () => void
}

export const AliasItem = (props: Props) => {
  const { item, index, deleteRelayAddress, setShowEditModal, isFreeAccount, navigation } = props
  const { color, translate, copyToClipboard } = useMixins()
  const { toolStore } = useStores()

  const [isOpen, setIsOpen] = useState(false)
  const [nextModal, setNextModal] = useState<'copy' | 'edit' | 'remove' | null>(null)

  const handleRemove = async () => {
    const res = await toolStore.deleteRelayAddress(item.id)
    if (res.kind === 'ok') {
      deleteRelayAddress(item.id)
    }
  }
  const handleActionSheetClose = () => {
    setIsOpen(false)

    switch (nextModal) {
      case 'copy':
        copyToClipboard(item.full_address)
        break
      case 'edit':
        setShowEditModal()
        break
      case 'remove':
        handleRemove()
        break
    }
  }

  return (
    <View style={{ marginVertical: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text preset="bold" text={item.full_address} style={{ marginBottom: 4 }} />
          <Text text={moment.unix(item.created_time).format('DD/MM/YYYY')} />
        </View>
        <Button
          preset="link"
          onPress={() => {
            setIsOpen(true)
            setNextModal(null)
          }}
        >
          <IoniconsIcon name="ellipsis-horizontal" size={18} color={color.textBlack} />
        </Button>
        <ActionSheet isOpen={isOpen} onClose={handleActionSheetClose}>
          {/* Info */}
          <View style={{ width: '100%', paddingHorizontal: 20 }}>
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
              <View>
                <Text preset="bold" text={item.full_address} style={{ marginBottom: 4 }} />
                <Text text={moment.unix(item.created_time).format('DD/MM/YYYY')} />
              </View>
            </View>
          </View>
          {/* Info end */}
          <Divider style={{ marginTop: 10 }} />

          <ActionSheetContent contentContainerStyle={{ paddingVertical: 5 }}>
            <ActionItem
              name={translate('private_relay.copy')}
              icon="copy"
              action={() => {
                setNextModal('copy')
                setIsOpen(false)
              }}
            />
            <Divider />
            {index === 0 && (
              <>
                <ActionItem
                  name={translate('private_relay.edit')}
                  icon="edit"
                  action={() => {
                    setNextModal('edit')
                    setIsOpen(false)
                  }}
                />
                <Divider />
              </>
            )}
            {!isFreeAccount && (
              <>
                <ActionItem
                  name={"See statistics"}
                  icon="file-o"
                  action={() => {
                    navigation.navigate("aliasStatistic")
                    setIsOpen(false)
                  }}
                />
                <Divider />
              </>
            )}
            <ActionItem
              name={translate('common.delete')}
              icon="trash"
              textColor={color.error}
              action={() => {
                setNextModal('remove')
              }}
            />
          </ActionSheetContent>
        </ActionSheet>
      </View>
    </View>
  )
}
