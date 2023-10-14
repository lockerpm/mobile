/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect, FC } from 'react'
import { observer } from 'mobx-react-lite'
import orderBy from 'lodash/orderBy'
import { View } from 'react-native'
import { CipherList } from './CipherList'
import { AppStackScreenProps } from 'app/navigators'
import { useStores } from 'app/models'
import { useCipherData, useCipherHelper, useHelper } from 'app/services/hook'
import { TrustedContact } from 'app/static/types'
import { CipherData } from 'core/models/data'
import { Cipher } from 'core/models/domain'
import { CipherView } from 'core/models/view'
import { Header, Screen, Text } from 'app/components/cores'

export const ViewEAScreen: FC<AppStackScreenProps<'viewEA'>> = observer((props) => {
  const navigation = props.navigation
  const route = props.route

  const { translate } = useHelper()
  const { user } = useStores()

  const { getEncKeyFromDecryptedKey } = useCipherData()
  const { getCipherInfo } = useCipherHelper()

  const trustContact: TrustedContact = route.params.trusted
  // -------------- PARAMS ------------------
  const [isLoading, setIsLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [sortList, setSortList] = useState({
    orderField: 'revisionDate',
    order: 'desc',
  })

  const [ciphers, setCiphers] = useState([])

  // -------------- METHOD ------------------
  const mount = async () => {
    setIsLoading(true)
    const fetchKeyRes = await user.viewEA(trustContact.id)
    if (fetchKeyRes.kind !== 'ok') return
    try {
      const encKey = await getEncKeyFromDecryptedKey(fetchKeyRes.data.key_encrypted)
      const decCiphers = []
      const promises = []

      fetchKeyRes.data.ciphers.forEach((cipherResponse) => {
        const cipherData = new CipherData(cipherResponse)
        const cipher = new Cipher(cipherData)
        promises.push(
          cipher.decrypt(encKey).then((c) => {
            decCiphers.push(c)
          })
        )
      })

      await Promise.all(promises)
      let res = decCiphers.map((c: CipherView) => {
        const cipherInfo = getCipherInfo(c)
        const data = {
          ...c,
          imgLogo: cipherInfo.img,
        }
        return data
      })

      if (sortList) {
        const { orderField, order } = sortList
        res =
          orderBy(
            res,
            [(c) => (orderField === 'name' ? c.name && c.name.toLowerCase() : c.revisionDate)],
            [order]
          ) || []
      }

      // Delay loading
      setTimeout(() => {
        setIsLoading(false)
      }, 50)

      setCiphers(res)
    } catch (e) {
      //
    }
  }

  // -------------- EFFECT ------------------
  useEffect(() => {
    mount()
  }, [])

  // -------------- RENDER ------------------

  return (
    <Screen
      safeAreaEdges={['bottom']}
      header={
        <Header
          leftIcon="arrow-left"
          onLeftPress={() => navigation.goBack()}
          title={translate('emergency_access.view')}
        />
      }
      contentContainerStyle={{
        flex: 1,
      }}
    >
      {/* <SortAction
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        onSelect={(value: string, obj: { orderField: string, order: string }) => {
          setSortOption(value)
          setSortList(obj)
        }}
        value={sortOption}
      /> */}
      <Text
        text={translate('emergency_access.view_user_vault', { name: trustContact.full_name })}
        style={{ marginLeft: 20 }}
      />

      <CipherList
        ciphers={ciphers}
        navigation={navigation}
        onLoadingChange={setIsLoading}
        searchText={searchText}
        emptyContent={
          <View>
            <Text text="No data" />
          </View>
        }
      />
    </Screen>
  )
})
