import {useEffect, useState} from 'react';
import {Dimensions} from 'react-native';

export enum Orientation {
    PORTRAIT,
    LANDSCAPE
}


/**
 * A React Hook which updates when the orientation changes
 * @returns whether the user is in 'PORTRAIT' or 'LANDSCAPE'
 */
export function useOrientation(): Orientation {

  const isPortrait = () => {
    const dim = Dimensions.get('screen');
    return dim.height >= dim.width;
  };

  // State to hold the connection status
  const [orientation, setOrientation] = useState<Orientation>(
    isPortrait() ? Orientation.PORTRAIT : Orientation.LANDSCAPE,
  );

  useEffect(() => {
    const callback = () => {
      
      setOrientation(isPortrait() ? Orientation.PORTRAIT : Orientation.LANDSCAPE);
    }

    Dimensions.addEventListener('change', callback);

    return () => {
      Dimensions.removeEventListener('change', callback);
    };
  }, []);

  return orientation;
}