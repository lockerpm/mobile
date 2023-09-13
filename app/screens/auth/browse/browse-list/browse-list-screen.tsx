import React, { useEffect, useState } from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Text, Button, Layout, AutoImage as Image } from '../../../../components'
import { useNavigation } from '@react-navigation/native'
import { BROWSE_ITEMS } from '../../../../common/mappings'
import { useMixins } from '../../../../services/mixins'
import { commonStyles } from '../../../../theme'
import { useStores } from '../../../../models'
import { observer } from 'mobx-react-lite'
import { SharingStatus } from '../../../../config/types'
import { useCipherToolsMixins } from '../../../../services/mixins/cipher/tools'
import { CipherType } from '../../../../../core/enums'

export const BrowseListScreen = observer(() => {
  const navigation = useNavigation()
  const { translate, color, isDark } = useMixins()
  const { cipherStore, folderStore, collectionStore } = useStores()
  const { getCipherCount } = useCipherToolsMixins()

  const shareNotiCount =
    cipherStore.sharingInvitations.length +
    cipherStore.myShares.reduce((total, s) => {
      return total + s.members.filter((m) => m.status === SharingStatus.ACCEPTED).length
    }, 0)

  const [data, setData] = useState([])
  // const data = Object.keys(BROWSE_ITEMS).filter(key => !BROWSE_ITEMS[key].group).map(key => {
  //   return {
  //     ...BROWSE_ITEMS[key],
  //     notiCount: key === 'shares' ? shareNotiCount : 0
  //   }
  // })

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
    <Layout
      borderBottom
      hasBottomNav
      containerStyle={{
        backgroundColor: isDark ? color.background : color.block,
        paddingTop: 0,
      }}
      header={<Text preset="largeHeader" text={translate('common.browse')} />}
    >
      <View
        style={{
          backgroundColor: isDark ? color.block : color.background,
          borderRadius: 10,
          paddingHorizontal: 14,
          marginTop: 20,
        }}
      >
        {data.map((item, index) => (
          <Button
            key={index}
            preset="link"
            onPress={() => {
              navigation.navigate(item.routeName)
            }}
            style={{
              borderBottomColor: color.line,
              borderBottomWidth: index === Object.keys(BROWSE_ITEMS).length - 1 ? 0 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
            }}
          >
            {item.svgIcon ? (
              <item.svgIcon height={40} width={40} />
            ) : (
              <Image source={item?.icon} style={{ height: 40, width: 40 }} />
            )}
            <View style={[commonStyles.CENTER_HORIZONTAL_VIEW, { flex: 1, paddingHorizontal: 10 }]}>
              <Text tx={item.label} style={{ color: color.title, marginRight: 10 }} />
              {item.notiCount > 0 && (
                <View
                  style={{
                    backgroundColor: color.error,
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
                      color: color.white,
                      lineHeight: 17,
                    }}
                  />
                </View>
              )}
            </View>
            {<Text text={item.total} style={{ marginRight: 12 }} />}
            <Icon name="angle-right" size={20} color={color.title} />
          </Button>
        ))}
      </View>
    </Layout>
  )
})
