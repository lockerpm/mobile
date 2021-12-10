import React, { useState } from "react"
import { View } from "react-native"
import { observer } from "mobx-react-lite"
import { color as colorLight, colorDark, commonStyles, fontSize } from "../../theme"
import { Button } from "../button/button"
import { Text } from "../text/text"
import { Header } from "../header/header"
import { SearchBar } from "../search-bar/search-bar"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useStores } from "../../models"
import { useMixins } from "../../services/mixins"
import { DeleteConfirmModal } from "../../screens/auth/browse/trash/delete-confirm-modal"

// @ts-ignore
import ConfigIcon from './config.svg'
// @ts-ignore
import ConfigIconLight from './config-light.svg'
// @ts-ignore
import PlusIcon from './plus.svg'
// @ts-ignore
import PlusIconLight from './plus-light.svg'


export interface BrowseItemHeaderProps {
  openSort?: Function,
  openAdd?: Function,
  navigation: any,
  header: string,
  onSearch?: (text: string) => void,
  searchText?: string
  isSelecting: boolean
  setIsSelecting: Function
  selectedItems: string[]
  setSelectedItems: Function
  toggleSelectAll: Function
  setIsLoading: Function
  isTrash?: boolean
  isAuthenticator?: boolean
}

/**
 * Describe your component here
 */
export const BrowseItemHeader = observer(function BrowseItemHeader(props: BrowseItemHeaderProps) {
  const { 
    openAdd, openSort, navigation, header, onSearch, searchText, isTrash, isAuthenticator,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, toggleSelectAll, setIsLoading
  } = props
  const { uiStore } = useStores()
  const { translate, toTrashCiphers, restoreCiphers, deleteCiphers } = useMixins()
  const color = uiStore.isDark ? colorDark : colorLight

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  
  // ----------------------- METHODS ------------------------

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

  const handleRestore = async () => {
    setIsLoading(true)
    const res = await restoreCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === 'ok') {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  const handlePermaDelete = async () => {
    setIsLoading(true)
    const res = await deleteCiphers(selectedItems)
    setIsLoading(false)
    if (res.kind === 'ok') {
      setIsSelecting(false)
      setSelectedItems([])
    }
  }

  // ----------------------- RENDER ------------------------

  const renderHeaderRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between'
      }]}
    >
      <Button
        preset="link"
        style={{ marginRight: openAdd ? 20 : 0 }}
        onPress={() => openSort && openSort()}
      >
        {
          uiStore.isDark ? (
            <ConfigIconLight height={17} />
          ) : (
            <ConfigIcon height={17} />
          )
        }
      </Button>

      {
        openAdd && (
          <Button
            preset="link"
            onPress={() => openAdd && openAdd()}
          >
            {
              uiStore.isDark ? (
                <PlusIconLight height={18} />
              ) : (
                <PlusIcon height={18} />
              )
            }
          </Button>
        )
      }
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
            {
              isTrash || isAuthenticator ? (
                <>
                  {
                    isTrash && (
                      <Button
                        preset="link"
                        onPress={handleRestore}
                        style={{ marginLeft: 20 }}
                      >
                        <FontAwesomeIcon
                          name="repeat"
                          size={17}
                          color={color.textBlack}
                        />
                      </Button>
                    )
                  }

                  <Button
                    preset="link"
                    onPress={() => setShowConfirmModal(true)}
                    style={{ marginLeft: 20 }}
                  >
                    <FontAwesomeIcon
                      name="trash"
                      size={20}
                      color={color.error}
                    />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    preset="link"
                    onPress={handleMoveFolder}
                    style={{ marginLeft: 20 }}
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
                    style={{ marginLeft: 20 }}
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
          </>
        )
      }
    </View>
  )

  const renderHeaderSelectLeft = () => (
    <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
      <Button
        preset="link"
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
          marginLeft: 15
        }}
      />
    </View>
  )

  return (
    <Header
      goBack={() => navigation.goBack()}
      right={isSelecting ? renderHeaderSelectRight() : renderHeaderRight()}
      left={isSelecting ? renderHeaderSelectLeft() : null}
    >
      <View style={{ marginTop: 10 }}>
				{
          !isSelecting && (
            <Text
              preset="largeHeader"
              text={header}
              style={{ marginBottom: 10 }}
            />
          )
        }

        <SearchBar value={searchText} onSearch={onSearch} />
      </View>

      <DeleteConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={isTrash || isAuthenticator ? handlePermaDelete : handleDelete}
        title={isTrash || isAuthenticator ? translate('trash.perma_delete') : translate('trash.to_trash')}
        desc={isTrash || isAuthenticator ? translate('trash.perma_delete_desc') : translate('trash.to_trash_desc')}
        btnText="OK"
      />
    </Header>
  )
})
