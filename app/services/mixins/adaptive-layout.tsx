import React, { createContext, useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { Dimensions } from 'react-native';
import { isTablet } from 'react-native-device-info';

//Guideline sizes are based on standard ~5" screen mobile device
const BASEWIDTH = 380;
const BASEHEIGHT = 720;

const { width, height } = Dimensions.get("window");

export const scale = (size) => {
    return size * Math.min(width, height) / BASEWIDTH;
}
export const verticalScale = (size) => {
    return size * Math.max(width, height) / BASEHEIGHT;
}

// Adaptive layout context data

const defaultData = {
    scale: (size: number) => { return 0 },
    verticalScale: (size: number) => { return 0 },
    isTablet: false,
    isPortrait: true,
}

export const AdaptiveLayoutMixinsContext = createContext(defaultData)

export const AdaptiveLayoutMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {


    const isPortrait = () => {
        const { width, height } = Dimensions.get("window");
        return height >= width;
    };

    // State to hold the connection status
    // true if Orientation is PORTRAIT, false if Orientation is LANDSCAPE
    const [portrait, setPortrait] = useState<boolean>(isPortrait());


    useEffect(() => {
        const callback = () => {
            setPortrait(isPortrait());
        }

        Dimensions.addEventListener('change', callback);
        return () => {
            Dimensions.removeEventListener('change', callback);
        };
    }, []);

    // -------------------- REGISTER FUNCTIONS ------------------

    const data = {
        scale,
        verticalScale,
        isTablet: isTablet(),
        isPortrait: isPortrait(),
    }

    return (
        <AdaptiveLayoutMixinsContext.Provider value={data}>
            {props.children}
        </AdaptiveLayoutMixinsContext.Provider>
    )
})


export const useAdaptiveLayoutMixins = () => useContext(AdaptiveLayoutMixinsContext)