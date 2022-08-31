import React from "react"
import { View, Share, TouchableOpacity, Image, SafeAreaView } from "react-native"
import { Button, Text } from "../../../../components"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import { useNavigation, RouteProp, useRoute } from "@react-navigation/native"
import LinearGradient from 'react-native-linear-gradient';
import { IS_IOS } from "./../../../../config/constants"
import { PrimaryParamList } from "../../../../navigators"
import Feather from 'react-native-vector-icons/Feather'

type ScreenProp = RouteProp<PrimaryParamList, 'refer_friend'>;

export const ReferFriendScreen = observer(function ReferFriendScreen() {
    const navigation = useNavigation()
    const route = useRoute<ScreenProp>();
    const { translate, color, copyToClipboard } = useMixins()
    const gradientColor = IS_IOS ? ['#F1F2F3', '#D5EBD920', '#26833460'] : ['#FFFFFF', '#D5EBD920', '#26833460']

    const onShare = async () => {
        try {
            const result = await Share.share({
                message: translate("refer_friend.refer_header") + route.params.referLink,
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            alert(error.message);
        }
    };

    // ----------------------- RENDER -----------------------
    return (
        <SafeAreaView
            style={{
                backgroundColor: color.block,
                paddingHorizontal: 0,
                flex: 1
            }}
        >

            <LinearGradient colors={gradientColor} style={{
                height: "40%",
                borderBottomRightRadius: 60,
                borderBottomLeftRadius: 60,
                alignItems: "center",
                justifyContent: "center"
            }}>
                <View style={{
                    position: "absolute",
                    top: "10%",
                    zIndex: 2,
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    paddingHorizontal: 15,
                    paddingTop: 15,
                    width: "100%",
                }}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Image
                            source={require("./Cross.png")}
                            style={{ height: 24, width: 24, alignSelf: "flex-end" }}
                        />
                    </TouchableOpacity>
                </View>
                <Image source={require('./refer.png')} style={{
                    marginTop: 20,
                    width: 200,
                    height: 200
                }} />
            </LinearGradient>
            <View style={{
                marginHorizontal: 20
            }}>
                <Text preset="header"
                    style={{ marginTop: 32 }}
                    text={translate('refer_friend.title')} />
                <Text preset="default"
                    style={{ marginVertical: 16 }}
                    text={translate('refer_friend.desc')} />


                <TouchableOpacity
                    onPress={() => copyToClipboard(translate("refer_friend.refer_header") + route.params.referLink)}
                    style={{
                        borderColor: color.textBlack,
                        borderRadius: 4,
                        borderWidth: 0.2,
                        padding: 10,
                        flexDirection: "row"
                    }}>
                    <Feather name="link" size={18} color={color.textBlack}/>
                    <Text preset="black" text={route.params.referLink ? route.params.referLink : "Plack Holder"} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>

            <Button
                style={{
                    marginHorizontal: 20,
                    marginTop: 16
                }}
                text={translate('refer_friend.btn')} onPress={() => onShare()} />

        </SafeAreaView>
    )
})
