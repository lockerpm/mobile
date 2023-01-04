import React from "react"
import { View } from "react-native"
import IoniconsIcon from 'react-native-vector-icons/Ionicons'
import { useMixins } from "../../../../../services/mixins"
import { Button, Text } from "../../../../../components"
import { commonStyles } from "../../../../../theme"
import { CollectionView } from "../../../../../../core/models/view/collectionView"
import { FOLDER_IMG } from "../../../../../common/mappings"


type Prop = {
    item: CollectionView
    openActionMenu: (val: any) => void
    navigation: any
    isOnlyView?: boolean
}

export const CollectionListItem = (props: Prop) => {
    const { item, openActionMenu, navigation } = props
    const { color } = useMixins()
    
    return (
        <Button
            preset="link"
            onPress={() => {
                navigation.navigate('folders__ciphers', { collectionId: item.id, organizationId: item.organizationId })
            }}
            style={{
                borderBottomColor: color.line,
                borderBottomWidth: 0.5,
                paddingVertical: 15,
                height: 70.5
            }}
        >
            <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                {/* Share folder avatar */}

                <FOLDER_IMG.share.svg height={40} width={40} />

                {/* Share folder avatar end */}

                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={commonStyles.CENTER_HORIZONTAL_VIEW}>
                        <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                            <Text
                                preset="semibold"
                                text={item.name}
                                numberOfLines={1}
                            />
                            <Button
                                preset="link"
                                onPress={() => openActionMenu(item)}
                            >
                                <IoniconsIcon
                                    name="ellipsis-horizontal"
                                    size={18}
                                    color={color.textBlack}
                                />
                            </Button>
                        </View>

                    </View>
                </View>
            </View>
        </Button>
    )
}
