import React, { useEffect, useState } from "react"
import { TextInput, View, Modal, TouchableOpacity, Image, FlatList } from "react-native"
import { observer } from "mobx-react-lite"
import { useStores } from "../../../models"
import { useMixins } from "../../../services/mixins"
import { Button } from "../../button/button"
import { Text } from "../../text/text"
import { commonStyles } from "../../../theme"
import { CipherView } from "../../../../core/models/view"
import { useCipherDataMixins } from "../../../services/mixins/cipher/data"
import { AccountRoleText } from "../../../config/types"
import { GroupData, GroupMemberData } from "../../../services/api"
import { AppEventType, EventBus } from "../../../utils/event-bus"
import { Icon } from "../../icon/icon"
import Entypo from 'react-native-vector-icons/Entypo'
import { SharedGroupType, SharedMemberType } from "../../../config/types/api"
import { SharedUsers } from "./shared-user"

interface Props {
  isOpen?: boolean
  onClose?: () => void
  cipherIds?: string[]
  onSuccess?: () => void
}

export const ShareModal = observer((props: Props) => {
  const { isOpen, onClose, cipherIds, onSuccess } = props
  const { cipherStore, enterpriseStore, user } = useStores()
  const { translate, color, notifyApiError } = useMixins()
  const { shareCipher, shareMultipleCiphers, stopShareCipher } = useCipherDataMixins()

  const selectedCipher: CipherView = cipherStore.cipherView

  // --------------- PARAMS ----------------
  const [page, setPage] = useState<0 | 1>(0)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [shareType, setShareType] = useState('view')
  const [groups, setGroups] = useState<{ name: string, id: string }[]>([]);
  type Suggest = GroupData | GroupMemberData
  const [suggestions, setSuggestions] = useState<Suggest[]>([])


  const [reload, setReload] = useState<boolean>(true)
  const [sharedUsers, setSharedUsers] = useState<SharedMemberType[]>([])

  const [sharedGroups, setSharedGroups] = useState<SharedGroupType[]>([])

  const sharedData = (() => {
    const data = []
    sharedGroups.forEach(e => {
      data.push({
        type: 'group',
        ...e
      })
    })
    sharedUsers.forEach(e => {
      data.push({
        type: 'user',
        ...e
      })
    })
    return data
  })()
  // --------------- COMPUTED ----------------

  const showManageShare = !!selectedCipher?.organizationId

  // --------------- METHODS ----------------

  const addEmail = (val: string) => {
    const e = val.trim().toLowerCase()
    if (!!e && !emails.includes(e)) {
      setEmails([...emails, e])
    }
    setEmail('')
  }

  const removeEmail = (val: string) => {
    setEmails(emails.filter(e => e !== val))
  }

  const getSharedUsers = async () => {
    const res = await cipherStore.loadMyShares()
    if (res.kind !== 'ok') {
      notifyApiError(res)
    }
    const share = cipherStore.myShares.find((s) => s.id === selectedCipher.organizationId)
    if (share) {
      if (share.members.length > 0)
        setSharedUsers(share.members)

      if (share.groups.length > 0)
        setSharedGroups(share.groups)

      return share.members?.length + share.groups?.length
    }
    return 0
  }

  const onRemove = async (id: string, isGroup?: boolean) => {
    const res = await stopShareCipher(selectedCipher, id)
    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      const sharedUserCount = await getSharedUsers()
      if (sharedUserCount === 0) {
        setPage(0)
      }
    }
  }

  // Share single/multiple
  const handleShare = async () => {
    setIsLoading(true)

    let role = AccountRoleText.MEMBER
    let autofillOnly = false
    switch (shareType) {
      case 'only_fill':
        autofillOnly = true
        break
      case 'edit':
        role = AccountRoleText.ADMIN
        break
    }

    const res = !!cipherIds
      ? await shareMultipleCiphers(cipherIds, emails, role, autofillOnly, groups)
      : await shareCipher(selectedCipher, emails, role, autofillOnly, groups)

    setIsLoading(false)

    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      if (res.kind === 'ok') {
        onSuccess && onSuccess()
      }
      onClose()
      reset()
    }
  }


  const searchGroupOrMember = async (query: string) => {
    const res = await enterpriseStore.searchGroupOrMember(user.enterprise.id, query)
    if (res.kind === 'ok') {
      setSuggestions([...res.data.groups, ...res.data.members].slice(0, 4))
    } else {
      notifyApiError(res)
    }
  }

  const reset = () => {
    setEmail("")
    setEmails([])
    setGroups([])
    setSuggestions([])
    setShareType('view')
    setReload(true)
    setSharedUsers([])
    setSharedGroups([])
  }
  // ----------------------- EFFECTS -----------------------

  // Close on signal
  useEffect(() => {
    const listener = EventBus.createListener(AppEventType.CLOSE_ALL_MODALS, () => {
      onClose()
    })
    return () => {
      EventBus.removeListener(listener)
    }
  }, [])

  useEffect(() => {
    if (user.isEnterprise) {
      const timeout = setTimeout(() => {
        if (email) {
          searchGroupOrMember(email)
        } else {
          setSuggestions([])
        }
      }, 500)
      return () => clearTimeout(timeout)
    }
    return null
  }, [email])

  useEffect(() => {
    if (!isOpen) {
      reset()
    } else {
      getSharedUsers()
    }
  }, [isOpen])

  useEffect(() => {
    page === 1 && getSharedUsers()
  }, [page, reload])

  // --------------- RENDER ----------------

  const renderAddUser = () => <View>

    <View style={{
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start"
    }}>
      <Text
        style={{ maxWidth: "50%" }}
        preset="header"
        text={cipherIds ? translate('shares.share_x_items', { count: cipherIds.length }) : selectedCipher.name}
      />
      {
        showManageShare && <Button
          preset="link"
          onPress={() => setPage(1)}
          text={translate('shares.share_folder.manage_user')} />
      }
    </View>

    <View style={{
      borderBottomColor: '#F2F2F5',
      borderBottomWidth: 1,
    }}>
      <View style={{
        width: "100%",
        flexDirection: "row",
      }}>
        <TouchableOpacity
          onPress={() => {
            addEmail(email)
          }}
          style={{ marginRight: 16, marginVertical: 16 }}
        >
          <Icon icon="user-plus" size={24} color={color.textBlack} />
        </TouchableOpacity>
        <TextInput
          placeholder={translate('shares.share_folder.add_email')}
          placeholderTextColor={color.text}
          selectionColor={color.primary}
          onChangeText={setEmail}
          value={email}
          clearButtonMode="unless-editing"
          clearTextOnFocus={true}
          onSubmitEditing={() => {
            addEmail(email)
          }}
          style={{
            color: color.textBlack
          }}
        >
        </TextInput>

      </View>
      <View>
        {
          emails.map((e, index) => {
            return (
              <View
                key={index}
                style={{
                  borderRadius: 8,
                  borderWidth: 0.5,
                  borderColor: color.block,
                  backgroundColor: color.block,
                  paddingLeft: 10,
                  marginBottom: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4
                }}
              >
                <Text
                  preset="black"
                  text={e}
                />

                <TouchableOpacity
                  onPress={() => removeEmail(e)}
                  style={{
                    paddingHorizontal: 12,
                    alignItems: 'center'
                  }}
                >
                  <Entypo name="circle-with-cross" size={20} color={color.textBlack} />
                </TouchableOpacity>
              </View>
            )
          })
        }
      </View>

      <View>
        {
          groups.map((e, index) => {
            return (
              <View
                key={index}
                style={{
                  borderRadius: 8,
                  borderWidth: 0.5,
                  borderColor: color.block,
                  backgroundColor: color.block,
                  paddingLeft: 10,
                  marginBottom: 16,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingVertical: 4
                }}
              >
                <Text
                  preset="black"
                  text={e.name}
                />

                <TouchableOpacity
                  onPress={() => setGroups(groups.filter(group => group.id !== e.id))}
                  style={{
                    paddingHorizontal: 12,
                    alignItems: 'center'
                  }}
                >
                  <Entypo name="circle-with-cross" size={20} color={color.textBlack} />
                </TouchableOpacity>
              </View>
            )
          })
        }
      </View>
    </View>


    <View style={{ marginTop: 20, marginBottom: 20 }}>
      <Text>{translate('invite_member.select_person')}</Text>
    </View>
    {
      !!email &&
      <TouchableOpacity onPress={() => addEmail(email)}>
        <View
          style={
            {
              borderBottomColor: color.block,
              borderBottomWidth: 1,
              width: "100%",
              flexDirection: "row",
              marginBottom: 15,
              paddingVertical: 14,
              justifyContent: "flex-start"
            }
          }>
          <Image
            source={require("./assets/avatar.png")}
            style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
          />

          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text
              preset="black"
              text={email}></Text>
          </View>
        </View>
      </TouchableOpacity>
    }

    {/* Enterprise suggestion */}
    {
      suggestions.length > 0 && <View style={{ marginTop: 20, marginBottom: 20 }}>
        <Text style={{ marginBottom: 20 }}>{translate('shares.suggestion')}</Text>
        {
          suggestions.map((e, index) =>
            <TouchableOpacity
              key={e + index.toString()}
              onPress={() => {
                if (!!e['email']) {
                  addEmail(e['email'])
                } else {
                  if (groups.some(e => e.id === e['id'])) {
                    return
                  }
                  setGroups([...groups, {
                    name: e['name'],
                    id: e['id']
                  }])
                }
              }}>
              <View
                style={
                  {
                    borderBottomColor: color.block,
                    borderBottomWidth: 1,
                    width: "100%",
                    flexDirection: "row",
                    paddingVertical: 8,
                    justifyContent: "flex-start"
                  }
                }>
                <Image
                  source={!!e['email'] ? { uri: e['avatar'] } : require("./assets/group.png")}
                  style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
                />

                <View style={{ flex: 1, justifyContent: 'center' }}>
                  <Text
                    preset="black"
                    text={e['email'] || e['name']}></Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
      </View>
    }
  </View>


  const renderManageShare = () => <View>
    <View style={{
      marginVertical: 20,
      flexDirection: 'row',
      justifyContent: 'space-between'
    }}>
      <Text preset="semibold" text={translate('shares.share_folder.share_with')} />
      <Button
        preset="link"
        onPress={() => {
          setPage(0)
        }}
        text={translate('common.add')}
      />
    </View>

    <FlatList
      scrollEnabled={true}
      data={sharedData}
      keyExtractor={(_, index) => String(index)}
      ListEmptyComponent={() => (
        <View>
          <Text text={translate('shares.share_folder.no_shared_users')} />
        </View>
      )}
      renderItem={({ item }) => (
        <SharedUsers
          reload={reload}
          setReload={setReload}
          item={item}
          organizationId={selectedCipher.organizationId}
          onRemove={onRemove}
        />
      )}
    />
  </View>
  return (
    <Modal
      presentationStyle="pageSheet"
      visible={isOpen}
      animationType="slide"
      onRequestClose={() => {
        onClose()
        reset()
      }}
    >
      <View style={[commonStyles.SECTION_PADDING, { flex: 1, backgroundColor: color.background }]}>
        <View style={{
          marginTop: 10,
          height: 40,
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between"
        }} >
          <TouchableOpacity
            onPress={() => onClose()}>
            <Icon icon="cross" size={18} color={color.textBlack} />
          </TouchableOpacity>
          {
            page === 0 && <Button
              preset="link"
              disabled={emails?.length < 1 && groups.length < 1}
              onPress={() => {
                handleShare();
              }}>
              <Text
                text={translate('common.done')}
                style={{
                  color: (emails?.length > 0 || groups.length > 0) ? color.primary : color.block
                }} />
            </Button>
          }
        </View>


        {
          page === 0 && renderAddUser()
        }
        {
          page === 1 && renderManageShare()
        }
      </View>
    </Modal>
  )
})
