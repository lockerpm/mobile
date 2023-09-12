import React, { useEffect, useState } from "react"
import { View, TouchableOpacity, TextInput, Image, Modal } from "react-native"
import { Button, Text, Icon } from "../../../../../components"
import { useStores } from "../../../../../models"
import { commonStyles } from "../../../../../theme"
import { useMixins } from "../../../../../services/mixins"
import Entypo from 'react-native-vector-icons/Entypo'
import { AppEventType, EventBus } from "../../../../../utils/event-bus"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { FolderView } from "../../../../../../core/models/view/folderView"
import { AccountRoleText } from "../../../../../config/types"
import { useFolderMixins } from "../../../../../services/mixins/folder"
import { GroupMemberData , GroupData} from "app/static/types"


interface InviteProps {
  isOpen: boolean
  folder?: FolderView | CollectionView
  onClose: () => void
  sharedUsers?: any[]
  isLoading?: boolean
}

export const AddUserShareFolderModal = (props: InviteProps) => {
  const { isOpen, onClose, sharedUsers, folder } = props
  const { user, enterpriseStore } = useStores()
  const { translate, color, notify, notifyApiError } = useMixins()
  const { shareFolder, shareFolderAddMember } = useFolderMixins()


  // ----------------------- PARAMS -----------------------

  const [email, setEmail] = useState<string>("");
  const [emails, setEmails] = useState<string[]>([]);

  const [groups, setGroups] = useState<{ name: string, id: string }[]>([]);
  type Suggest = GroupData | GroupMemberData
  const [suggestions, setSuggestions] = useState<Suggest[]>([])

  // ----------------------- METHODS -----------------------

  const addEmailToShare = (email: string) => {
    const e = email.trim().toLowerCase();
    if (!e) return;

    const isOwner = user?.email === e
    const isIncluded = sharedUsers?.some(element => element.email === e)
    if (!emails.includes(e) && !isOwner && !isIncluded) {
      setEmails([...emails, e])
      setEmail("")
    }
  }

  const removeEmailFromList = (val: string) => {
    setEmails(emails.filter(e => e !== val))
  }

  const addFolderMember = async (emails?: string[]) => {
    let res
    if (folder instanceof CollectionView) {
      res = await shareFolderAddMember(folder, emails, AccountRoleText.MEMBER, true, groups)
    } else {
      res = await shareFolder(folder, emails, AccountRoleText.MEMBER, true, groups)
    }

    onClose()
    if (res.kind === 'ok' || res.kind === 'unauthorized') {
      if (res.kind === 'ok') {
        notify("success", translate("shares.share_folder.success.shared"))
        setEmails([])
      }
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

  // ----------------------- RENDER -----------------------
  return (
    <Modal
      presentationStyle="pageSheet"
      visible={isOpen}
      animationType="slide"
      onRequestClose={() => {
        onClose()
        setEmail("")
        setEmails([])
        setGroups([])
        setSuggestions([])
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
          <Button
            preset="link"
            disabled={emails?.length < 1 && groups.length < 1}
            onPress={() => {
              addFolderMember(emails);
            }}>
            <Text
              text={translate('common.done')}
              style={{
                color: (emails?.length > 0 || groups.length > 0) ? color.primary : color.block
              }} />
          </Button>
        </View>

        <View style={{ marginTop: 8 }}>
          <Text preset="header" text={translate('shares.share_folder.select_member')} />
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
                addEmailToShare(email)
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
                addEmailToShare(email)
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
                      onPress={() => removeEmailFromList(e)}
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
          <TouchableOpacity onPress={() => addEmailToShare(email)}>
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
                source={require("./avatar.png")}
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
            <Text style={{ marginBottom: 8 }}>{"User or group in Enterprise".toUpperCase()}</Text>
            {
              suggestions.map((e, index) =>
                <TouchableOpacity
                  key={e + index.toString()}
                  onPress={() => {
                    if (!!e['email']) {
                      addEmailToShare(e['email'])
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
                      source={!!e['email'] ? { uri: e['avatar'] } : require("./group.png")}
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
    </Modal >
  )
}

