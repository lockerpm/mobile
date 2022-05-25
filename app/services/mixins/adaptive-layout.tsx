import React, { createContext, useContext, useState, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { spacing } from "../../theme";
import { Dimensions } from 'react-native';

//Guideline sizes are based on standard ~5" screen mobile device
const BASEWIDTH = 350;
const BASEHEIGHT = 680;

const { width, height } = Dimensions.get("window");

export const scale = (size) => {
    return size * Math.min(width, height) / BASEWIDTH;
}
export const verticalScale = (size) => {
    return size * Math.max(width, height) / BASEHEIGHT;
}

// Adaptive layout context data

const defaultData = {
    spacing,
    isPortrait: true,
    scale: (size: number) => { return 0 },
    verticalScale: (size: number) => { return 0 },
    isTablet: () => false
}

export const AdaptiveLayoutMixinsContext = createContext(defaultData)

export const AdaptiveLayoutMixinsProvider = observer((props: { children: boolean | React.ReactChild | React.ReactFragment | React.ReactPortal }) => {

  
    var scaleSpacing = spacing


    const checkPortrait = () => {
        return height >= width;
    };

    const isTablet = () => {
        const min = Math.min(width, height)
        return min > 700
    }

    // State to hold the connection status
    // true if Orientation is PORTRAIT, false if Orientation is LANDSCAPE
    const [isPortrait, setIsPortrait] = useState<boolean>(checkPortrait());

 

    useEffect(() => {
        Object.keys(spacing).forEach(key => scaleSpacing[key] = scale(spacing[key]))

        const callback = () => {
            setIsPortrait(checkPortrait());
        }

        Dimensions.addEventListener('change', callback);
        return () => {
            Dimensions.removeEventListener('change', callback);
        };
    }, []);

    // -------------------- REGISTER FUNCTIONS ------------------

    const data = {
        spacing: scaleSpacing,
        isPortrait,
        scale,
        verticalScale,
        isTablet
    }

    return (
        <AdaptiveLayoutMixinsContext.Provider value={data}>
            {props.children}
        </AdaptiveLayoutMixinsContext.Provider>
    )
})


export const useAdaptiveLayoutMixins = () => useContext(AdaptiveLayoutMixinsContext)