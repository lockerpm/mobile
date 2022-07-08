import React, { memo } from "react"
import {  View } from "react-native"
import MaterialCommunityIconsIcon from 'react-native-vector-icons/MaterialCommunityIcons'
// import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { SharingStatus } from "../../../../../config/types"
import { useMixins } from "../../../../../services/mixins"
import { Button, Text } from "../../../../../components"
import { commonStyles, fontSize } from "../../../../../theme"
import { useNavigation } from "@react-navigation/native"
import { FOLDER_IMG } from "../../../../../common/mappings"



type Prop = {
    item: any
    openActionMenu: (val: any) => void
}


export const CipherShareListItem = memo((props: Prop) => {
    const { item, openActionMenu } = props
    const navigation = useNavigation()
    const { translate } = useMixins()
    const { color } = useMixins()


    return (
        <View style={{ paddingHorizontal: 20 }}>
            <Button
                preset="link"
                onPress={() => {
                    if (item.teamShared) {
                        navigation.navigate('folders__ciphers', { collectionId: item.id, organizationId: item.organizationId })
                    } else {
                        navigation.navigate('folders__ciphers', { folderId: item.id })
                    }
                }}
                style={{
                    borderBottomColor: color.line,
                    borderBottomWidth: 0.5,
                    paddingVertical: 15,
                }}
            >
                <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                    {
                        item.teamShared ? (
                            <FOLDER_IMG.share.svg height={30} />
                        ) : (
                            <FOLDER_IMG.normal.svg height={30} />
                        )
                    }

                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Text
                                preset="semibold"
                                text={item.name || translate('folder.unassigned')}
                                numberOfLines={2}
                            />

                            {/* {
                                        ([...folderStore.notSynchedFolders, ...folderStore.notUpdatedFolders].includes(item.id)) && (
                                            <View style={{ marginLeft: 10 }}>
                                                <MaterialCommunityIconsIcon
                                                    name="cloud-off-outline"
                                                    size={22}
                                                    color={color.textBlack}
                                                />
                                            </View>
                                        )
                                    } */}
                        </View>

                        <Text
                            text={
                                (item.cipherCount !== undefined ? `${item.cipherCount}` : '0')
                                + ' '
                                + (item.cipherCount > 1 ? translate('common.items') : translate('common.item'))
                            }
                            style={{ fontSize: fontSize.small }}
                        />
                    </View>

                    {/* {
                                (!!item.id && item.editable) && (
                                    <Button
                                        preset="link"
                                        onPress={() => {
                                            setSelectedFolder(item)
                                            setIsActionOpen(true)
                                        }}
                                        style={{
                                            height: 35,
                                            width: 40,
                                            justifyContent: 'flex-end',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <IoniconsIcon
                                            name="ellipsis-horizontal"
                                            size={18}
                                            color={color.textBlack}
                                        />
                                    </Button>
                                )
                            } */}
                </View>
            </Button>
        </View>
    )
})