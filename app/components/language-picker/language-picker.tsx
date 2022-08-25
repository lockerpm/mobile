import React, { useState } from "react"
import { TouchableOpacity, View, ViewStyle } from "react-native"
import { commonStyles } from "../../theme"
import { Text } from "../text/text"
import Entypo from 'react-native-vector-icons/Entypo'
import { useStores } from "../../models"
import { observer } from "mobx-react-lite"

import VI from './vietnam.svg'
import EN from './united-states.svg'
import { useMixins } from "../../services/mixins"


export const LanguagePicker = observer(() => {
    const { user } = useStores()
    const { color } = useMixins()

    const [isSelecting, setIsSelecting] = useState(false)
    const CONTAINER: ViewStyle = {
        zIndex: 10,
        position: "absolute",
        left: 20,
        top: 16
    }
 
    const languages: {
        label: "vi" | "en",
        text: string,
        icon: JSX.Element
    }[] = [
            {
                label: 'vi',
                text: "Tiếng Việt",
                icon: <VI height={32} width={32} />
            },
            {
                label: 'en',
                text: "English",
                icon: <EN height={32} width={32} />
            }
        ]

    return (
        <View style={CONTAINER}>
            <TouchableOpacity
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                }}
                onPress={() => { setIsSelecting(!isSelecting) }}
            >
                {
                    languages[user.language === "vi" ? 0 : 1].icon
                }
                <Entypo name={isSelecting ? "chevron-small-up" : "chevron-small-down"} size={24} />
            </TouchableOpacity>
            <View style={{
                marginLeft: 8,
                paddingVertical: 4
            }}>
                {
                    isSelecting && languages.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                user.setLanguage(item.label)
                                user.setMobileChangeLanguage(true)
                                setIsSelecting(!isSelecting)
                            }}
                            style={[commonStyles.CENTER_HORIZONTAL_VIEW, {
                                backgroundColor: user.language === item.label ? color.block : color.background
                            }]}
                        >
                            {item.icon}
                            <Text preset="black" text={item.text} style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    ))
                }
            </View>


        </View>
    )
})