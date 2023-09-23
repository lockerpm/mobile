import React, { useEffect, useState } from 'react'
import { View, Image, TouchableOpacity } from 'react-native'
import { Text, Screen, TabHeader, Icon } from 'app/components-v2/cores'
import { useNavigation } from '@react-navigation/native'
import { observer } from 'mobx-react-lite'
import { useTheme } from 'app/services/context'
import { useStores } from 'app/models'
import { useTool } from 'app/services/hook'
import { SharingStatus } from 'app/static/types'
import { BROWSE_ITEMS } from 'app/navigators'
import { translate } from 'app/i18n'
import { CipherType } from 'core/enums'

export const BrowseListScreen = observer(() => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { cipherStore, folderStore, collectionStore } = useStores()
  const { getCipherCount } = useTool()

  const shareNotiCount =
    cipherStore.sharingInvitations.length +
    cipherStore.myShares.reduce((total, s) => {
      return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
    }, 0)

  const [data, setData] = useState([])

  const mount = async () => {
    const temp = Object.keys(BROWSE_ITEMS).filter((key) => !BROWSE_ITEMS[key].group)
    const data = await Promise.all(
      temp.map(async (key) => {
        let total = 0
        let suffix = ''
        switch (key) {
          case 'folder':
            total = folderStore.folders.length + collectionStore.collections.length
            suffix = ' ' + (total === 1 ? translate('common.folder') : translate('common.folders'))
            break
          case 'password':
            total = await getCipherCount(CipherType.Login)
            break
          case 'note':
            total = await getCipherCount(CipherType.SecureNote)
            break
          case 'card':
            total = await getCipherCount(CipherType.Card)
            break
          case 'cryptoWallet':
            total = await getCipherCount(CipherType.CryptoWallet)
            break
          case 'identity':
            total = await getCipherCount(CipherType.Identity)
            break
          case 'shares':
            total = await getCipherCount(CipherType.Login, false, true)
            break
          case 'trash':
            total = await getCipherCount(CipherType.Login, true)
            break
        }

        return {
          ...BROWSE_ITEMS[key],
          notiCount: key === 'shares' ? shareNotiCount : 0,
          total: total ? `${total}${suffix}` : '',
        }
      })
    )
    setData(data)
  }
  useEffect(() => {
    mount()
  }, [cipherStore.lastSync, cipherStore.lastCacheUpdate])

  return (
    <Screen
      padding
      safeAreaEdges={['bottom']}
      header={<TabHeader title={translate('common.browse')} />}
      backgroundColor={colors.block}
    >
      <View
        style={{
          borderRadius: 12,
          marginTop: 20,
          overflow: 'hidden'
        }}
      >
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              navigation.navigate(item.routeName)
            }}
            style={{
              borderBottomColor: colors.border,
              borderBottomWidth: index === Object.keys(BROWSE_ITEMS).length - 1 ? 0 : 1,
              backgroundColor: colors.background,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              paddingHorizontal: 16
            }}
          >
            {item.svgIcon ? (
              <item.svgIcon height={40} width={40} />
            ) : (
              <Image source={item?.icon} style={{ height: 40, width: 40 }} />
            )}
            <View style={{ flex: 1, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' }}>
              <Text tx={item.label} style={{ marginRight: 10 }} />
              {item.notiCount > 0 && (
                <View
                  style={{
                    backgroundColor: colors.error,
                    borderRadius: 20,
                    minWidth: 17,
                    height: 17,
                  }}
                >
                  <Text
                    text={item.notiCount.toString()}
                    style={{
                      fontSize: 12,
                      textAlign: 'center',
                      color: colors.white,
                      lineHeight: 17,
                    }}
                  />
                </View>
              )}
            </View>
            {<Text preset='label' text={item.total} style={{ marginRight: 12 }} />}

            <Icon icon="caret-right" size={20} />
          </TouchableOpacity>
        ))}
      </View>
    </Screen>
  )
})
