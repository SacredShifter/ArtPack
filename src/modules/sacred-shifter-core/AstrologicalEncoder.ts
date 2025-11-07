import { ParticipantIdentity, ParticipantSignature } from './ParticipantEncoder';
import { AstrologicalSignature, AstrologicalCalculator, NatalChart } from './AstrologicalCalculator';

export interface AstrologicalParticipantSignature extends ParticipantSignature {
  astrology: {
    sunSign: string;
    sunHue: number;
    moonSign: string;
    moonLuminosity: number;
    risingSign: string;
    risingRotation: number;

    element: 'fire' | 'earth' | 'air' | 'water';
    elementIntensity: number;

    planets: {
      mercury: { connectionStrength: number; lineStyle: string };
      venus: { harmony: number; smoothness: number };
      mars: { speed: number; angularity: number };
      jupiter: { expansion: number; glowRadius: number };
      saturn: { structure: number; sharpness: number };
      uranus: { chaos: number; colorShift: number };
      neptune: { transcendence: number; blur: number };
      pluto: { transformation: number; shadowDepth: number };
    };

    housePosition: number;
    dominantHouse: number;

    retrogradeCount: number;
  };

  aspects: Array<{
    type: string;
    otherParticipantId?: string;
    strength: number;
    color: [number, number, number];
  }>;
}

export class AstrologicalEncoder {
  static encodeWithAstrology(
    identity: ParticipantIdentity,
    astroSignature: AstrologicalSignature,
    totalParticipants: number,
    participantIndex: number
  ): AstrologicalParticipantSignature {
    const { natalChart, aspects, elementBalance, dominantElement } = astroSignature;

    const sunZodiac = AstrologicalCalculator.getZodiacInfo(natalChart.sun.sign);
    const moonZodiac = AstrologicalCalculator.getZodiacInfo(natalChart.moon.sign);
    const risingZodiac = AstrologicalCalculator.getZodiacInfo(natalChart.rising.sign);

    const sunHue = sunZodiac?.hue || 0;
    const moonLuminosity = this.moonToLuminosity(natalChart.moon.sign, moonZodiac?.element);
    const risingRotation = this.risingToRotation(natalChart.rising.sign, risingZodiac?.modality);

    const dominantHouse = this.findDominantHouse(natalChart);
    const houseAngle = (dominantHouse * 30) % 360;
    const goldenAngle = 137.508;
    const positionAngle = (houseAngle + participantIndex * goldenAngle) % 360;

    const elementIntensity = elementBalance[dominantElement];
    const positionRadius = 0.3 + (participantIndex / totalParticipants) * 0.6;

    const colorSat = this.elementToSaturation(dominantElement);
    const colorLight = this.elementToLightness(dominantElement, moonLuminosity);

    const amplitude = identity.personalCoherence || 0.7;
    const phaseOffset = (identity.joinedAt % 10000) / 10000;

    const retrogradeCount = this.countRetrogrades(natalChart);

    const geometryType = this.determineGeometry(totalParticipants, identity.role, natalChart.sun.sign);
    const blendWeight = 1.0 / Math.sqrt(totalParticipants);

    return {
      id: identity.id,
      seedValue: 0,
      colorHue: sunHue,
      colorSat,
      colorLight,
      phaseOffset,
      positionAngle,
      positionRadius,
      amplitude,
      rotationSpeed: risingRotation,
      geometryType,
      blendWeight,

      astrology: {
        sunSign: natalChart.sun.sign,
        sunHue,
        moonSign: natalChart.moon.sign,
        moonLuminosity,
        risingSign: natalChart.rising.sign,
        risingRotation,

        element: dominantElement,
        elementIntensity,

        planets: {
          mercury: this.encodeMercury(natalChart.mercury),
          venus: this.encodeVenus(natalChart.venus),
          mars: this.encodeMars(natalChart.mars),
          jupiter: this.encodeJupiter(natalChart.jupiter),
          saturn: this.encodeSaturn(natalChart.saturn),
          uranus: this.encodeUranus(natalChart.uranus),
          neptune: this.encodeNeptune(natalChart.neptune),
          pluto: this.encodePluto(natalChart.pluto)
        },

        housePosition: natalChart.sun.house,
        dominantHouse,
        retrogradeCount
      },

      aspects: aspects.map(aspect => this.encodeAspect(aspect))
    };
  }

  private static moonToLuminosity(moonSign: string, element?: string): number {
    const baseLuminosity: Record<string, number> = {
      'Cancer': 0.9,
      'Taurus': 0.8,
      'Pisces': 0.75,
      'Leo': 0.7,
      'Libra': 0.7,
      'Scorpio': 0.4,
      'Capricorn': 0.5,
      'Aquarius': 0.6,
      'Aries': 0.65,
      'Gemini': 0.65,
      'Virgo': 0.55,
      'Sagittarius': 0.7
    };

    return baseLuminosity[moonSign] || 0.6;
  }

  private static risingToRotation(risingSign: string, modality?: string): number {
    if (modality === 'cardinal') return 1.2;
    if (modality === 'fixed') return 0.5;
    if (modality === 'mutable') return 1.5;
    return 1.0;
  }

  private static elementToSaturation(element: string): number {
    const satMap: Record<string, number> = {
      fire: 0.9,
      earth: 0.6,
      air: 0.7,
      water: 0.8
    };
    return satMap[element] || 0.7;
  }

  private static elementToLightness(element: string, moonLum: number): number {
    const baseLight: Record<string, number> = {
      fire: 0.65,
      earth: 0.45,
      air: 0.7,
      water: 0.55
    };

    return (baseLight[element] || 0.6) * moonLum;
  }

  private static findDominantHouse(chart: NatalChart): number {
    const houseCounts: Record<number, number> = {};

    [chart.sun, chart.moon, chart.mercury, chart.venus, chart.mars].forEach(planet => {
      houseCounts[planet.house] = (houseCounts[planet.house] || 0) + 1;
    });

    let maxHouse = 1;
    let maxCount = 0;

    Object.entries(houseCounts).forEach(([house, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxHouse = parseInt(house);
      }
    });

    return maxHouse;
  }

  private static countRetrogrades(chart: NatalChart): number {
    let count = 0;
    if (chart.mercury.retrograde) count++;
    if (chart.venus.retrograde) count++;
    if (chart.mars.retrograde) count++;
    if (chart.jupiter.retrograde) count++;
    if (chart.saturn.retrograde) count++;
    if (chart.uranus.retrograde) count++;
    if (chart.neptune.retrograde) count++;
    if (chart.pluto.retrograde) count++;
    return count;
  }

  private static determineGeometry(
    totalParticipants: number,
    role: string,
    sunSign: string
  ): 'point' | 'glyph' | 'mandala' | 'field' {
    if (totalParticipants === 1) return 'mandala';
    if (totalParticipants <= 50) {
      return role === 'co-creator' ? 'mandala' : 'glyph';
    }
    if (totalParticipants <= 1000) return 'glyph';
    return 'point';
  }

  private static encodeMercury(mercury: any) {
    const connectionStrength = mercury.retrograde ? 0.3 : 0.8;
    const lineStyle = mercury.retrograde ? 'dashed' : 'solid';
    return { connectionStrength, lineStyle };
  }

  private static encodeVenus(venus: any) {
    const harmony = venus.retrograde ? 0.5 : 0.9;
    const smoothness = (venus.degree / 30) * 0.5 + 0.5;
    return { harmony, smoothness };
  }

  private static encodeMars(mars: any) {
    const speed = mars.retrograde ? 0.4 : 1.2;
    const angularity = (mars.degree / 30) * 0.7 + 0.3;
    return { speed, angularity };
  }

  private static encodeJupiter(jupiter: any) {
    const expansion = jupiter.retrograde ? 1.0 : 1.5;
    const glowRadius = (jupiter.degree / 30) * 0.3 + 0.2;
    return { expansion, glowRadius };
  }

  private static encodeSaturn(saturn: any) {
    const structure = saturn.retrograde ? 0.7 : 1.0;
    const sharpness = (saturn.degree / 30) * 0.5 + 0.5;
    return { structure, sharpness };
  }

  private static encodeUranus(uranus: any) {
    const chaos = uranus.retrograde ? 0.3 : 0.8;
    const colorShift = (uranus.degree / 30) * 60;
    return { chaos, colorShift };
  }

  private static encodeNeptune(neptune: any) {
    const transcendence = neptune.retrograde ? 0.5 : 0.9;
    const blur = (neptune.degree / 30) * 0.4 + 0.1;
    return { transcendence, blur };
  }

  private static encodePluto(pluto: any) {
    const transformation = pluto.retrograde ? 0.6 : 1.0;
    const shadowDepth = (pluto.degree / 30) * 0.5 + 0.3;
    return { transformation, shadowDepth };
  }

  private static encodeAspect(aspect: any) {
    const colorMap: Record<string, [number, number, number]> = {
      conjunction: [1.0, 1.0, 1.0],
      trine: [0.2, 0.8, 0.3],
      sextile: [0.3, 0.6, 1.0],
      square: [1.0, 0.3, 0.2],
      opposition: [0.9, 0.5, 0.9],
      quincunx: [0.7, 0.7, 0.2]
    };

    const strengthMap: Record<string, number> = {
      conjunction: 1.0,
      trine: 0.8,
      sextile: 0.6,
      square: 0.7,
      opposition: 0.9,
      quincunx: 0.4
    };

    return {
      type: aspect.type,
      strength: strengthMap[aspect.type] || 0.5,
      color: colorMap[aspect.type] || [0.5, 0.5, 0.5]
    };
  }

  static calculateSynastry(
    signature1: AstrologicalParticipantSignature,
    signature2: AstrologicalParticipantSignature
  ): {
    compatibility: number;
    sharedAspects: any[];
    elementHarmony: number;
    description: string;
  } {
    const elem1 = signature1.astrology.element;
    const elem2 = signature2.astrology.element;

    const elementCompatibility: Record<string, Record<string, number>> = {
      fire: { fire: 0.8, earth: 0.4, air: 0.9, water: 0.3 },
      earth: { fire: 0.4, earth: 0.8, air: 0.5, water: 0.9 },
      air: { fire: 0.9, earth: 0.5, air: 0.8, water: 0.6 },
      water: { fire: 0.3, earth: 0.9, air: 0.6, water: 0.8 }
    };

    const elementHarmony = elementCompatibility[elem1]?.[elem2] || 0.5;

    const signCompatibility = this.calculateSignCompatibility(
      signature1.astrology.sunSign,
      signature2.astrology.sunSign
    );

    const compatibility = (elementHarmony + signCompatibility) / 2;

    let description = '';
    if (compatibility > 0.8) description = 'Highly harmonious';
    else if (compatibility > 0.6) description = 'Compatible';
    else if (compatibility > 0.4) description = 'Dynamic tension';
    else description = 'Challenging';

    return {
      compatibility,
      sharedAspects: [],
      elementHarmony,
      description
    };
  }

  private static calculateSignCompatibility(sign1: string, sign2: string): number {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];

    const index1 = signs.indexOf(sign1);
    const index2 = signs.indexOf(sign2);

    if (index1 === -1 || index2 === -1) return 0.5;

    const distance = Math.min(
      Math.abs(index1 - index2),
      12 - Math.abs(index1 - index2)
    );

    if (distance === 0) return 0.7;
    if (distance === 2 || distance === 10) return 0.6;
    if (distance === 4 || distance === 8) return 0.9;
    if (distance === 6) return 0.5;

    return 0.5;
  }

  static calculateGroupElementBalance(
    signatures: AstrologicalParticipantSignature[]
  ): {
    fire: number;
    earth: number;
    air: number;
    water: number;
    dominant: string;
    description: string;
  } {
    const totals = { fire: 0, earth: 0, air: 0, water: 0 };

    signatures.forEach(sig => {
      totals[sig.astrology.element]++;
    });

    const total = signatures.length;
    const balance = {
      fire: totals.fire / total,
      earth: totals.earth / total,
      air: totals.air / total,
      water: totals.water / total
    };

    const dominant = Object.entries(balance)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    const descriptions: Record<string, string> = {
      fire: 'Dynamic and action-oriented energy',
      earth: 'Grounded and practical focus',
      air: 'Intellectual and communicative flow',
      water: 'Emotional and intuitive depth'
    };

    return {
      ...balance,
      dominant,
      description: descriptions[dominant] || 'Balanced collective energy'
    };
  }
}
