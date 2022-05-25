import React from "react"
import { View, Image, Dimensions, TouchableOpacity } from "react-native"
import { Text } from "../../../../components"
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome'
import { useMixins } from "../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"



export const ReferFriendMenuItem = () => {
    const { color, translate } = useMixins()
    const navigation = useNavigation()
    return (
        <TouchableOpacity
        onPress={()=> navigation.navigate('refer_friend')}
            style={{
                marginVertical: 24,
            }}>
            <View style={{
                paddingHorizontal: 16,
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                backgroundColor: "#072245",
                height: 80,
                justifyContent: "center"
            }}>
                <Image source={require('./refer-locker.png')} style={{
                    width: 128, height: 104,
                    position: "absolute",
                    right: 16
                }} />
                <Text preset="bold" style={{
                    color: color.white,
                    maxWidth: Dimensions.get('screen').width - 200
                }} text={translate('refer_friend.menu_title')} />
            </View>
            <View style={{
                backgroundColor: color.primary,
                paddingHorizontal: 16,
                paddingVertical: 15,
                flex: 1,
                flexDirection: "row",
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                justifyContent: "space-between"
            }}>

                <Text preset="bold" style={{ color: color.white }} text={translate('refer_friend.navigate')} />
                <FontAwesomeIcon
                    name="angle-right"
                    size={18}
                    color={color.white}
                />
            </View>
        </TouchableOpacity>
    )
}
