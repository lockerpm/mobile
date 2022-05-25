import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';

export enum Orientation {
  PORTRAIT,
  LANDSCAPE
}

export enum AdaptiveUI {
  NORMAL,
  TABLET
}


/**
 * A React Hook which updates when the orientation changes
 * @returns whether the user is in 'PORTRAIT' or 'LANDSCAPE'
 */
export function useOrientation(): {orientation: Orientation, screenSize: AdaptiveUI } {

  const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
  };

  const isTablet = () => {
    const width = Math.min(Dimensions.get('screen').width, Dimensions.get('screen').height)
    return width > 700
  }

  // State to hold the connection status
  const [orientation, setOrientation] = useState<Orientation>(
    isPortrait() ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
  );

  // State to hold the connection status
  const [screenSize, setScreenSize] = useState<AdaptiveUI>(
    isTablet() ? AdaptiveUI.TABLET : AdaptiveUI.NORMAL,
  );

  useEffect(() => {
    const callback = () => {
      setScreenSize(isTablet() ? AdaptiveUI.TABLET : AdaptiveUI.NORMAL)
      setOrientation(isPortrait() ? Orientation.PORTRAIT : Orientation.LANDSCAPE);
    }

    Dimensions.addEventListener('change', callback);

    return () => {
      Dimensions.removeEventListener('change', callback);
    };
  }, []);

  return {orientation, screenSize};
}