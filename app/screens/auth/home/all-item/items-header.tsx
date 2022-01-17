import React, { useState } from "react"
import { View, ViewStyle } from "react-native"
import { Button, Header, SearchBar, Text } from "../../../../components"
import { commonStyles, fontSize } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { DeleteConfirmModal } from "../../browse/trash/delete-confirm-modal"

// @ts-ignore
import ConfigIcon from './config.svg'
// @ts-ignore
import ConfigIconLight from './config-light.svg'
// @ts-ignore
import PlusIcon from './plus.svg'
// @ts-ignore
import PlusIconLight from './plus-light.svg'
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"


interface Props {
  openSort: Function,
  openAdd: Function,
  onSearch: (text: string) => void
  searchText: string
  isSelecting: boolean
  setIsSelecting: Function
  selectedItems: string[]
  setSelectedItems: Function
  toggleSelectAll: Function
  setIsLoading: Function
  navigation: any
}

const BUTTON_LEFT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-start',
  alignItems: 'center'
}

const BUTTON_RIGHT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-end',
  alignItems: 'center'
}

export const ItemsHeader = (props: Props) => {
  const { 
    openAdd, openSort, onSearch, searchText, setIsLoading, navigation,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, toggleSelectAll
  } = props
  const { translate, color, isDark } = useMixins()
  const { toTrashCiphers } = useCipherDataMixins()

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  // ----------------------- METHODS ------------------------

  const renderHeaderRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between'
      }]}
    >
      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => openSort && openSort()}
      >
        {
          isDark ? (
            <ConfigIconLight height={17} />
          ) : (
            <ConfigIcon height={17} />
          )
        }
      </Button>

      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => openAdd && openAdd()}
      >
        {
          isDark ? (
            <PlusIconLight height={18} />
          ) : (
            <PlusIcon height={18} />
          )
        }
      </Button>
    </View>
  )

  const renderHeaderSelectRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between'
      }]}
    >
      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => toggleSelectAll()}
      >
        <IoniconsIcon
          name="checkmark-done"
          size={24}
          color={color.textBlack}
        />
      </Button>

      {
        selectedItems.length > 0 && (
          <>
            <Button
              preset="link"
              onPress={handleMoveFolder}
              style={BUTTON_RIGHT}
            >
              <FontAwesomeIcon
                name="folder-o"
                size={20}
                color={color.textBlack}
              />
            </Button>

            <Button
              preset="link"
              onPress={() => setShowConfirmModal(true)}
              style={BUTTON_RIGHT}
            >
              <FontAwesomeIcon
                name="trash"
                size={20}
                color={color.error}
              />
            </Button>
          </>
        )
      }
    </View>
  )

  const renderHeaderSelectLeft = () => (
    <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
      <Button
        preset="link"
        style={BUTTON_LEFT}
        onPress={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      >
        <IoniconsIcon
          name="close"
          size={26}
          color={color.title}
        />
      </Button>

      <Text
        preset="black"
        text={selectedItems.length ? `${selectedItems.length} ${translate('common.selected')}` : translate('common.select')}
        style={{
          fontSize: fontSize.h5,
          marginLeft: 5
        }}
      />
    </View>
  )

  const handleDelete = async () => {
    setIsLoading(true)
    const res = await toTrashCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === 'ok') {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  const handleMoveFolder = () => {
    navigation.navigate('folders__select', {
      mode: 'move',
      initialId: null,
      cipherIds: selectedItems
    })
  }

  // ----------------------- RENDER ------------------------

  return (
    <Header
      showLogo={!isSelecting}
      right={isSelecting ? renderHeaderSelectRight() : renderHeaderRight()}
      left={isSelecting ? renderHeaderSelectLeft() : null}
    >
      <SearchBar
        style={{ marginTop: 15 }}
        onSearch={onSearch}
        value={searchText}
      />

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title={translate('trash.to_trash')}
        desc={translate('trash.to_trash_desc')}
        btnText="OK"
      />
    </Header>
  )
}
