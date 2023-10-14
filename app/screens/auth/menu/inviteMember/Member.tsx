import React, { useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { BottomModal, Icon, Text } from 'app/components/cores'
import { useTheme } from 'app/services/context'
import { useHelper } from 'app/services/hook'

export interface FamilyMemberProp {
  id?: number
  email: string
  avatar?: string
  created_time?: string
  username?: string
  full_name?: string
}

interface MemberProps {
  member: FamilyMemberProp
  family?: boolean
  add?: boolean
  onRemove?: (id: string) => Promise<void>
}

export const Member = (props: MemberProps) => {
  const { member, family, add, onRemove } = props
  const { id, email, avatar, full_name } = member
  const { colors } = useTheme()
  const { translate } = useHelper()

  const owner = id === null
  // ----------------------- PARAMS -----------------------

  const [showSheetModal, setShowSheetModal] = useState<boolean>(false)

  // ----------------------- RENDER -----------------------
  return (
    <View
      style={{
        borderBottomColor: colors.block,
        borderBottomWidth: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 14,
        justifyContent: 'flex-start',
      }}
    >
      <Image
        source={avatar ? { uri: avatar } : require('./avatar.png')}
        style={{ height: 40, width: 40, borderRadius: 20, marginRight: 10 }}
      />

      {add && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text text={email}></Text>
        </View>
      )}
      {!add && (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text
            text={full_name || 'Unknown'}
            style={{ color: owner ? colors.primary : colors.title }}
          />
          <Text text={email} style={{ color: colors.secondaryText, fontSize: 15 }} />
        </View>
      )}

      {!add && family && !owner && (
        <TouchableOpacity
          onPress={() => setShowSheetModal(true)}
          style={{ justifyContent: 'center' }}
        >
          <Icon icon="dots-three" size={20} />
        </TouchableOpacity>
      )}

      <BottomModal title="" isOpen={showSheetModal} onClose={() => setShowSheetModal(false)}>
        <View style={{ alignItems: 'center' }}>
          <Image
            source={avatar ? { uri: avatar } : require('./avatar.png')}
            style={{ height: 40, width: 40, borderRadius: 20 }}
          />
          <Text style={{ marginVertical: 20 }}>{email}</Text>
          <View
            style={{
              borderBottomColor: colors.block,
              borderWidth: 0.4,
              width: '100%',
              marginVertical: 2,
            }}
          ></View>
          <TouchableOpacity
            onPress={() => {
              setShowSheetModal(false)
              onRemove(id.toString())
            }}
            style={{ justifyContent: 'center' }}
          >
            <Text style={{ marginTop: 20, color: colors.error }}>
              {translate('invite_member.remove')}
            </Text>
          </TouchableOpacity>
        </View>
      </BottomModal>
    </View>
  )
}
