import React, { useEffect, useState } from "react"
import { View, ViewStyle } from "react-native"
import { Button, Header, SearchBar, Text, Icon } from "../../../../components"
import { commonStyles, fontSize } from "../../../../theme"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { DeleteConfirmModal } from "../../browse/trash/delete-confirm-modal"
import { useCipherDataMixins } from "../../../../services/mixins/cipher/data"
import { ShareModal } from "../../../../components/cipher/cipher-action/share-modal"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../../models"
import ConfigIcon from './config.svg'
import ConfigIconLight from './config-light.svg'
import PlusIcon from './plus.svg'
import PlusIconLight from './plus-light.svg'
import { PlanType } from "../../../../config/types"
import { AppNotification } from "../../../../services/api"


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
  alignItems: 'center',
  paddingLeft: 8
}

const BUTTON_RIGHT: ViewStyle = {
  height: 35,
  width: 35,
  justifyContent: 'flex-end',
  alignItems: 'center',
  paddingRight: 8
}

export const ItemsHeader = observer((props: Props) => {
  const {
    openAdd, openSort, onSearch, searchText, setIsLoading, navigation,
    isSelecting, setIsSelecting, selectedItems, setSelectedItems, toggleSelectAll
  } = props
  const { translate, color, isDark, notifyApiError } = useMixins()
  const { toTrashCiphers } = useCipherDataMixins()
  const { user, uiStore } = useStores()

  // ----------------------- PARAMS ------------------------

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification>(null)

  // ----------------------- COMPUTED ------------------------

  const isFreeAccount = (user.plan?.alias === PlanType.FREE) || !user.plan

  // ----------------------- METHODS ------------------------

  const fetchInAppNotification = async () => {
    if (navigation.isFocused()) {
      const res = await user.fetchInAppNoti()
      if (res.kind === "ok") {

        setNotifications(res.data)
      } else {
        notifyApiError(res)
      }
    }
  }

  // ----------------------- EFFECT ------------------------

  // Check online/offline interval
  useEffect(() => {
    fetchInAppNotification()
    const interval = setInterval(fetchInAppNotification, 1000 * 30)
    return () => {
      clearInterval(interval)
    }
  }, [])


  // Header right
  const renderHeaderRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        marginRight: -8
      }]}
    >
      {/** In app notification */}
      <Button
        preset="link"
        style={BUTTON_RIGHT}
        onPress={() => {
          navigation.navigate('app_list_noti', {
            notifications
          })
        }}
      >
        {
          notifications?.unread_count > 0 && <View style={{
            position: "absolute",
            top: 5,
            right: 5,
            height: 6,
            width: 6,
            borderRadius: 3,
            backgroundColor: color.error
          }} />
        }
        <Icon icon="bell" size={24} color={color.textBlack} />
      </Button>
      {/** In app notification end*/}

      {/** Sort */}
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
      {/** Sort end */}

      {/** add */}
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
      {/** add */}
    </View>
  )

  // Select right
  const renderHeaderSelectRight = () => (
    <View
      style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
        justifyContent: 'space-between',
        marginRight: -8
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
            {
              !uiStore.isOffline && !isFreeAccount && (
                <Button
                  preset="link"
                  onPress={() => setShowShareModal(true)}
                  style={BUTTON_RIGHT}
                >
                  <FontAwesomeIcon
                    name="share-square-o"
                    size={20}
                    color={color.textBlack}
                  />
                </Button>
              )
            }
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

  // Select left
  const renderHeaderSelectLeft = () => (
    <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { marginLeft: -8 }]}>
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

  // Actions

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
    setIsSelecting(false)
    setSelectedItems([])
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        cipherIds={selectedItems}
        onSuccess={() => {
          setIsSelecting(false)
          setSelectedItems([])
        }}
      />
    </Header>
  )
})
