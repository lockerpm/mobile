import React, { useState, useEffect } from 'react'
import { View, Alert, TouchableOpacity } from 'react-native'
import { Screen, Text, Header } from 'app/components/cores'
import { useNavigation } from '@react-navigation/native'

import { FamilyMemberProp, Member } from './Member'
import { InviteMemberModal } from './InviteModal'
import { useStores } from 'app/models'
import { useHelper } from 'app/services/hook'
import { useTheme } from 'app/services/context'
import { PlanType } from 'app/static/types'
import { FAMILY_MEMBER_LIMIT } from 'app/static/constants'
import { observer } from 'mobx-react-lite'

export const InviteMemberScreen = observer(() => {
  const navigation = useNavigation()
  const { user } = useStores()
  const { colors } = useTheme()
  const { notifyApiError, notify, translate } = useHelper()

  // ----------------------- PARAMS -----------------------
  const [reload, setRelad] = useState<boolean>(true)
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberProp[]>([])
  const [showInviteMemberModal, setShowInviteMemberModal] = useState(false)

  const isFamilyAccount =
    user.plan?.alias === PlanType.FAMILY || user.plan?.alias === PlanType.LIFETIME_FAMILY

  // ----------------------- METHODS -----------------------

  const getFamilyMember = async () => {
    const res = await user.getFamilyMember()
    if (res.kind === 'ok') {
      setFamilyMembers(res.data)
    } else {
      notifyApiError(res)
    }
  }

  const comfirmRemoveMember = async (id: string) => {
    Alert.alert(
      translate('invite_member.confirm'),
      '',
      [
        {
          text: translate('common.yes'),
          onPress: () => {
            removeFamilyMember(id)
          },
          style: 'destructive',
        },
        {
          text: translate('common.cancel'),
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
      }
    )
  }
  const removeFamilyMember = async (id: string) => {
    const res = await user.removeFamilyMember(id)
    if (res.kind === 'ok') {
      setRelad(true)
      notify('success', translate('invite_member.delete_noti'))
    } else {
      notifyApiError(res)
    }
  }
  // ----------------------- EFFECT -----------------------
  useEffect(() => {
    if (reload) {
      setRelad(false)
      getFamilyMember()
    }
  }, [reload])

  // ----------------------- RENDER -----------------------
  return (
    <Screen
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => {
            navigation.goBack()
          }}
          title={translate('invite_member.header')}
        />
      }
      padding
      contentContainerStyle={{
        flex: 1,
      }}
    >
      <InviteMemberModal
        isShow={showInviteMemberModal}
        onClose={setShowInviteMemberModal}
        familyMembers={familyMembers}
        setRelad={setRelad}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text preset="bold" style={{ marginBottom: 20, fontSize: 16 }}>
          {translate('invite_member.number_member')} ({familyMembers?.length} / 6)
        </Text>
        {isFamilyAccount && (
          <TouchableOpacity
            disabled={familyMembers?.length >= FAMILY_MEMBER_LIMIT}
            onPress={() => {
              setShowInviteMemberModal(true)
            }}
          >
            <Text
              style={{
                color:
                  familyMembers?.length < FAMILY_MEMBER_LIMIT ? colors.primary : colors.background,
              }}
            >
              {translate('invite_member.action')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View>
        {familyMembers.map((e, index) => {
          return (
            <Member
              key={index}
              family={isFamilyAccount}
              member={e}
              onRemove={comfirmRemoveMember}
            />
          )
        })}
      </View>
    </Screen>
  )
})
