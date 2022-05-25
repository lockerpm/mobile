import { isTablet } from "react-native-device-info"

const spacingNormal = {
    none: 0,
    tiny: 4,
    smaller: 8,
    small: 12,
    medium: 16,
    large: 24,
    huge: 32,
    massive: 64
} 

const spacingTablet = {
    none: 0,
    tiny: 8,
    smaller: 12,
    small: 16,
    medium: 20,
    large: 28,
    huge: 36,
    massive: 68
} 

export const spacing = isTablet() ? spacingTablet : spacingNormal