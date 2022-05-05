import React, { useState, useEffect } from "react"
import { View, Alert, ImageBackground, Share } from "react-native"
import { commonStyles } from "../../../../theme"
import { Button, Layout, Text, Header } from "../../../../components"
import { useStores } from "../../../../models"
import { observer } from "mobx-react-lite"
import { useMixins } from "../../../../services/mixins"
import { useNavigation } from "@react-navigation/native"


export const ReferFriendScreen = observer(function ReferFriendScreen() {
    const navigation = useNavigation()
    const { user } = useStores()
    const { translate, color, notifyApiError, notify } = useMixins()


    const onShare = async () => {
        try {
            const result = await Share.share({
                message: "https://locker.io/",
            });
            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    console.log(result.activityType)
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
    // ----------------------- PARAMS -----------------------


    // ----------------------- METHODS -----------------------


    // ----------------------- RENDER -----------------------
    return (
        <Layout
            header={(
                <Header
                    goBack={() => {
                        navigation.goBack()
                    }}
                    right={(<View style={{ width: 30 }} />)}
                />
            )}
            footer={(
                <Button
                    onPress={onShare}
                    text="Refer link to you"
                ></Button>
            )}
            containerStyle={{ backgroundColor: color.block, paddingHorizontal: 0 }}
        >
            <ImageBackground style={[commonStyles.SECTION_PADDING, { backgroundColor: color.white, flex: 1, justifyContent: "center" }]} source={require('./t2.jpeg')}>

            </ImageBackground>
        </Layout >
    )
})
