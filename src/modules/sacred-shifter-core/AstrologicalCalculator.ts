export interface BirthData {
  date: Date;
  time?: string;
  location: {
    lat: number;
    lng: number;
    city: string;
    timezone: string;
  };
}

export interface ZodiacSign {
  name: string;
  element: 'fire' | 'earth' | 'air' | 'water';
  modality: 'cardinal' | 'fixed' | 'mutable';
  ruler: string;
  hue: number;
}

export interface PlanetPosition {
  sign: string;
  degree: number;
  house: number;
  retrograde: boolean;
}

export interface NatalChart {
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  uranus: PlanetPosition;
  neptune: PlanetPosition;
  pluto: PlanetPosition;
  rising: { sign: string; degree: number };
  houses: number[];
  northNode: PlanetPosition;
  southNode: PlanetPosition;
}

export interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  angle: number;
  orb: number;
  applying: boolean;
}

export interface AstrologicalSignature {
  natalChart: NatalChart;
  aspects: Aspect[];
  elementBalance: {
    fire: number;
    earth: number;
    air: number;
    water: number;
  };
  modalityBalance: {
    cardinal: number;
    fixed: number;
    mutable: number;
  };
  dominantElement: 'fire' | 'earth' | 'air' | 'water';
  dominantSign: string;
  chartShape: string;
}

export class AstrologicalCalculator {
  private static ZODIAC_SIGNS: Record<string, ZodiacSign> = {
    'Aries': { name: 'Aries', element: 'fire', modality: 'cardinal', ruler: 'Mars', hue: 0 },
    'Taurus': { name: 'Taurus', element: 'earth', modality: 'fixed', ruler: 'Venus', hue: 120 },
    'Gemini': { name: 'Gemini', element: 'air', modality: 'mutable', ruler: 'Mercury', hue: 60 },
    'Cancer': { name: 'Cancer', element: 'water', modality: 'cardinal', ruler: 'Moon', hue: 200 },
    'Leo': { name: 'Leo', element: 'fire', modality: 'fixed', ruler: 'Sun', hue: 30 },
    'Virgo': { name: 'Virgo', element: 'earth', modality: 'mutable', ruler: 'Mercury', hue: 100 },
    'Libra': { name: 'Libra', element: 'air', modality: 'cardinal', ruler: 'Venus', hue: 300 },
    'Scorpio': { name: 'Scorpio', element: 'water', modality: 'fixed', ruler: 'Pluto', hue: 280 },
    'Sagittarius': { name: 'Sagittarius', element: 'fire', modality: 'mutable', ruler: 'Jupiter', hue: 15 },
    'Capricorn': { name: 'Capricorn', element: 'earth', modality: 'cardinal', ruler: 'Saturn', hue: 150 },
    'Aquarius': { name: 'Aquarius', element: 'air', modality: 'fixed', ruler: 'Uranus', hue: 180 },
    'Pisces': { name: 'Pisces', element: 'water', modality: 'mutable', ruler: 'Neptune', hue: 250 }
  };

  static calculateNatalChart(birthData: BirthData): NatalChart {
    const julianDay = this.dateToJulianDay(birthData.date, birthData.time);
    const localSiderealTime = this.calculateLocalSiderealTime(
      julianDay,
      birthData.location.lng
    );

    const sun = this.calculatePlanetPosition('sun', julianDay, localSiderealTime, birthData.location.lat);
    const moon = this.calculatePlanetPosition('moon', julianDay, localSiderealTime, birthData.location.lat);
    const mercury = this.calculatePlanetPosition('mercury', julianDay, localSiderealTime, birthData.location.lat);
    const venus = this.calculatePlanetPosition('venus', julianDay, localSiderealTime, birthData.location.lat);
    const mars = this.calculatePlanetPosition('mars', julianDay, localSiderealTime, birthData.location.lat);
    const jupiter = this.calculatePlanetPosition('jupiter', julianDay, localSiderealTime, birthData.location.lat);
    const saturn = this.calculatePlanetPosition('saturn', julianDay, localSiderealTime, birthData.location.lat);
    const uranus = this.calculatePlanetPosition('uranus', julianDay, localSiderealTime, birthData.location.lat);
    const neptune = this.calculatePlanetPosition('neptune', julianDay, localSiderealTime, birthData.location.lat);
    const pluto = this.calculatePlanetPosition('pluto', julianDay, localSiderealTime, birthData.location.lat);

    const rising = this.calculateRising(localSiderealTime, birthData.location.lat);
    const houses = this.calculateHouses(rising.degree, birthData.location.lat);

    const northNode = this.calculateNode(julianDay, true);
    const southNode = this.calculateNode(julianDay, false);

    return {
      sun,
      moon,
      mercury,
      venus,
      mars,
      jupiter,
      saturn,
      uranus,
      neptune,
      pluto,
      rising,
      houses,
      northNode,
      southNode
    };
  }

  private static dateToJulianDay(date: Date, time?: string): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let hour = 0;
    let minute = 0;
    if (time) {
      const [h, m] = time.split(':').map(Number);
      hour = h;
      minute = m;
    }

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
      Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const dayFraction = (hour + minute / 60) / 24;
    return jdn + dayFraction - 0.5;
  }

  private static calculateLocalSiderealTime(julianDay: number, longitude: number): number {
    const T = (julianDay - 2451545.0) / 36525;
    const GMST = 280.46061837 + 360.98564736629 * (julianDay - 2451545.0) +
      0.000387933 * T * T - (T * T * T) / 38710000;

    const LST = (GMST + longitude) % 360;
    return LST < 0 ? LST + 360 : LST;
  }

  private static calculatePlanetPosition(
    planet: string,
    julianDay: number,
    lst: number,
    latitude: number
  ): PlanetPosition {
    const T = (julianDay - 2451545.0) / 36525;

    let L = 0;
    switch (planet) {
      case 'sun':
        L = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
        break;
      case 'moon':
        L = 218.3165 + 481267.8813 * T;
        break;
      case 'mercury':
        L = 252.25032 + 149472.67411 * T;
        break;
      case 'venus':
        L = 181.97973 + 58517.81539 * T;
        break;
      case 'mars':
        L = 355.43327 + 19140.30268 * T;
        break;
      case 'jupiter':
        L = 34.35152 + 3034.90567 * T;
        break;
      case 'saturn':
        L = 50.07744 + 1222.11379 * T;
        break;
      case 'uranus':
        L = 314.05500 + 428.46611 * T;
        break;
      case 'neptune':
        L = 304.34867 + 218.46515 * T;
        break;
      case 'pluto':
        L = 238.92881 + 145.18042 * T;
        break;
    }

    L = L % 360;
    if (L < 0) L += 360;

    const sign = this.degreeToSign(L);
    const signDegree = L % 30;
    const house = this.calculateHousePosition(L, lst, latitude);

    return {
      sign,
      degree: signDegree,
      house,
      retrograde: this.isRetrograde(planet, T)
    };
  }

  private static calculateNode(julianDay: number, north: boolean): PlanetPosition {
    const T = (julianDay - 2451545.0) / 36525;
    let nodePosition = 125.04452 - 1934.136261 * T;

    if (!north) {
      nodePosition = (nodePosition + 180) % 360;
    }

    nodePosition = nodePosition % 360;
    if (nodePosition < 0) nodePosition += 360;

    return {
      sign: this.degreeToSign(nodePosition),
      degree: nodePosition % 30,
      house: 0,
      retrograde: true
    };
  }

  private static isRetrograde(planet: string, T: number): boolean {
    if (planet === 'sun' || planet === 'moon') return false;

    const retrogradeProbs: Record<string, number> = {
      mercury: 0.19,
      venus: 0.07,
      mars: 0.09,
      jupiter: 0.33,
      saturn: 0.37,
      uranus: 0.42,
      neptune: 0.43,
      pluto: 0.44
    };

    const phase = (T * 1000) % 1;
    return phase < (retrogradeProbs[planet] || 0);
  }

  private static degreeToSign(degree: number): string {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    const index = Math.floor(degree / 30);
    return signs[index % 12];
  }

  private static calculateRising(lst: number, latitude: number): { sign: string; degree: number } {
    const obliquity = 23.44;
    const ascendant = Math.atan2(
      Math.sin(lst * Math.PI / 180),
      Math.cos(lst * Math.PI / 180) * Math.cos(obliquity * Math.PI / 180) -
      Math.tan(latitude * Math.PI / 180) * Math.sin(obliquity * Math.PI / 180)
    ) * 180 / Math.PI;

    let degree = (ascendant + 360) % 360;
    return {
      sign: this.degreeToSign(degree),
      degree: degree % 30
    };
  }

  private static calculateHouses(ascendantDegree: number, latitude: number): number[] {
    const houses: number[] = [ascendantDegree];

    for (let i = 1; i < 12; i++) {
      houses.push((ascendantDegree + i * 30) % 360);
    }

    return houses;
  }

  private static calculateHousePosition(degree: number, lst: number, latitude: number): number {
    const rising = this.calculateRising(lst, latitude);
    const houses = this.calculateHouses(rising.degree, latitude);

    for (let i = 0; i < 12; i++) {
      const currentHouse = houses[i];
      const nextHouse = houses[(i + 1) % 12];

      if (nextHouse > currentHouse) {
        if (degree >= currentHouse && degree < nextHouse) return i + 1;
      } else {
        if (degree >= currentHouse || degree < nextHouse) return i + 1;
      }
    }

    return 1;
  }

  static calculateAspects(chart: NatalChart): Aspect[] {
    const aspects: Aspect[] = [];
    const planets = [
      { name: 'sun', pos: chart.sun },
      { name: 'moon', pos: chart.moon },
      { name: 'mercury', pos: chart.mercury },
      { name: 'venus', pos: chart.venus },
      { name: 'mars', pos: chart.mars },
      { name: 'jupiter', pos: chart.jupiter },
      { name: 'saturn', pos: chart.saturn },
      { name: 'uranus', pos: chart.uranus },
      { name: 'neptune', pos: chart.neptune },
      { name: 'pluto', pos: chart.pluto }
    ];

    const aspectTypes = [
      { name: 'conjunction', angle: 0, orb: 8 },
      { name: 'opposition', angle: 180, orb: 8 },
      { name: 'trine', angle: 120, orb: 8 },
      { name: 'square', angle: 90, orb: 7 },
      { name: 'sextile', angle: 60, orb: 6 },
      { name: 'quincunx', angle: 150, orb: 3 }
    ];

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i];
        const p2 = planets[j];

        const absoluteDegree1 = this.signToDegree(p1.pos.sign) + p1.pos.degree;
        const absoluteDegree2 = this.signToDegree(p2.pos.sign) + p2.pos.degree;

        let diff = Math.abs(absoluteDegree1 - absoluteDegree2);
        if (diff > 180) diff = 360 - diff;

        for (const aspectType of aspectTypes) {
          const orb = Math.abs(diff - aspectType.angle);
          if (orb <= aspectType.orb) {
            aspects.push({
              planet1: p1.name,
              planet2: p2.name,
              type: aspectType.name as any,
              angle: aspectType.angle,
              orb,
              applying: diff < aspectType.angle
            });
          }
        }
      }
    }

    return aspects;
  }

  private static signToDegree(sign: string): number {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs.indexOf(sign) * 30;
  }

  static generateAstrologicalSignature(birthData: BirthData): AstrologicalSignature {
    const natalChart = this.calculateNatalChart(birthData);
    const aspects = this.calculateAspects(natalChart);

    const elements = { fire: 0, earth: 0, air: 0, water: 0 };
    const modalities = { cardinal: 0, fixed: 0, mutable: 0 };

    const allPlacements = [
      natalChart.sun.sign,
      natalChart.moon.sign,
      natalChart.mercury.sign,
      natalChart.venus.sign,
      natalChart.mars.sign,
      natalChart.jupiter.sign,
      natalChart.saturn.sign,
      natalChart.uranus.sign,
      natalChart.neptune.sign,
      natalChart.pluto.sign,
      natalChart.rising.sign
    ];

    allPlacements.forEach(sign => {
      const zodiac = this.ZODIAC_SIGNS[sign];
      if (zodiac) {
        elements[zodiac.element]++;
        modalities[zodiac.modality]++;
      }
    });

    const dominantElement = Object.entries(elements)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0] as any;

    const elementBalance = {
      fire: elements.fire / allPlacements.length,
      earth: elements.earth / allPlacements.length,
      air: elements.air / allPlacements.length,
      water: elements.water / allPlacements.length
    };

    const modalityBalance = {
      cardinal: modalities.cardinal / allPlacements.length,
      fixed: modalities.fixed / allPlacements.length,
      mutable: modalities.mutable / allPlacements.length
    };

    return {
      natalChart,
      aspects,
      elementBalance,
      modalityBalance,
      dominantElement,
      dominantSign: natalChart.sun.sign,
      chartShape: this.determineChartShape(natalChart)
    };
  }

  private static determineChartShape(chart: NatalChart): string {
    return 'bowl';
  }

  static getZodiacInfo(sign: string): ZodiacSign | undefined {
    return this.ZODIAC_SIGNS[sign];
  }
}
