import { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';

import { jollyRogerSvg } from './jollyRogerSvg';

/** Crew-Logo: Totenkopf beißt in einen Döner, gekreuzte Knochen (gleiche Vorlage wie das App-Icon) */
export function JollyRoger({ size = 96 }: { size?: number }) {
  const xml = useMemo(() => jollyRogerSvg(), []);
  return <SvgXml xml={xml} width={size} height={size} />;
}
