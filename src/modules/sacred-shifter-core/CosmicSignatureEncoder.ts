import { ParticipantIdentity, ParticipantSignature } from './ParticipantEncoder';
import { AstrologicalSignature, AstrologicalCalculator, BirthData, NatalChart } from './AstrologicalCalculator';
import { AstrologicalEncoder, AstrologicalParticipantSignature } from './AstrologicalEncoder';
import { RegionSeed, GAAState } from './types';

export interface CosmicSignature extends AstrologicalParticipantSignature {
  cosmic: {
    birthLocation: { lat: number; lng: number };
    currentLocation: { lat: number; lng: number };

    locationResonance: number;
    geographicHarmonic: number;
    distanceFromBirth: number;

    currentTransits: {
      sunDegree: number;
      moonDegree: number;
      moonPhase: number;
    };

    transitInfluence: {
      intensity: number;
      harmonicResonance: number;
      activatedHouses: number[];
    };

    gaaAlignment: {
      personalFrequency: number;
      harmonicRatio: number;
      phaseSync: number;
    };

    temporalCoherence: number;
    multidimensionalDepth: number;
  };

  synastry: Map<string, {
    compatibility: number;
    connectionType: string;
    visualIntensity: number;
    aspectColors: [number, number, number][];
  }>;
}

export class CosmicSignatureEncoder {
  static async encodeComplete(
    identity: ParticipantIdentity,
    birthData: BirthData,
    currentLocation: { lat: number; lng: number },
    regionSeed: RegionSeed,
    gaaState: GAAState,
    totalParticipants: number,
    participantIndex: number,
    existingParticipants: CosmicSignature[] = []
  ): Promise<CosmicSignature> {

    const astroSignature = AstrologicalCalculator.generateAstrologicalSignature(birthData);

    const baseSignature = AstrologicalEncoder.encodeWithAstrology(
      identity,
      astroSignature,
      totalParticipants,
      participantIndex
    );

    const currentTransits = this.calculateCurrentTransits(currentLocation, regionSeed.timestamp);

    const locationResonance = this.calculateLocationResonance(
      birthData.location,
      currentLocation,
      regionSeed
    );

    const transitInfluence = this.calculateTransitInfluence(
      astroSignature.natalChart,
      currentTransits,
      gaaState
    );

    const gaaAlignment = this.calculateGAAAlignment(
      astroSignature,
      gaaState
    );

    const distanceFromBirth = this.haversineDistance(
      birthData.location.lat,
      birthData.location.lng,
      currentLocation.lat,
      currentLocation.lng
    );

    const geographicHarmonic = this.calculateGeographicHarmonic(
      birthData.location,
      currentLocation,
      regionSeed
    );

    const temporalCoherence = this.calculateTemporalCoherence(
      birthData.date,
      regionSeed.timestamp,
      gaaState
    );

    const multidimensionalDepth = this.calculateMultidimensionalDepth(
      astroSignature,
      locationResonance,
      transitInfluence,
      gaaAlignment
    );

    const synastry = this.calculateGroupSynastry(
      baseSignature,
      existingParticipants
    );

    return {
      ...baseSignature,
      cosmic: {
        birthLocation: birthData.location,
        currentLocation,
        locationResonance,
        geographicHarmonic,
        distanceFromBirth,
        currentTransits,
        transitInfluence,
        gaaAlignment,
        temporalCoherence,
        multidimensionalDepth
      },
      synastry
    };
  }

  private static calculateCurrentTransits(location: { lat: number; lng: number }, timestamp: number): {
    sunDegree: number;
    moonDegree: number;
    moonPhase: number;
  } {
    const date = new Date(timestamp);
    const julianDay = this.dateToJulianDay(date);
    const T = (julianDay - 2451545.0) / 36525;

    let sunLongitude = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    sunLongitude = sunLongitude % 360;
    if (sunLongitude < 0) sunLongitude += 360;

    let moonLongitude = 218.3165 + 481267.8813 * T;
    moonLongitude = moonLongitude % 360;
    if (moonLongitude < 0) moonLongitude += 360;

    const moonPhase = ((moonLongitude - sunLongitude + 360) % 360) / 360;

    return {
      sunDegree: sunLongitude,
      moonDegree: moonLongitude,
      moonPhase
    };
  }

  private static dateToJulianDay(date: Date): number {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();

    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;

    const jdn = day + Math.floor((153 * m + 2) / 5) + 365 * y +
      Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

    const dayFraction = (hour + minute / 60) / 24;
    return jdn + dayFraction - 0.5;
  }

  private static calculateLocationResonance(
    birthLocation: { lat: number; lng: number },
    currentLocation: { lat: number; lng: number },
    regionSeed: RegionSeed
  ): number {
    const birthToRegion = this.haversineDistance(
      birthLocation.lat,
      birthLocation.lng,
      regionSeed.lat,
      regionSeed.lng
    );

    const currentToRegion = this.haversineDistance(
      currentLocation.lat,
      currentLocation.lng,
      regionSeed.lat,
      regionSeed.lng
    );

    const proximity = 1.0 / (1.0 + currentToRegion / 1000);

    const resonance = proximity * 0.7 + (1.0 - Math.min(birthToRegion / 20000, 1.0)) * 0.3;

    return resonance;
  }

  private static haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static calculateGeographicHarmonic(
    birthLocation: { lat: number; lng: number },
    currentLocation: { lat: number; lng: number },
    regionSeed: RegionSeed
  ): number {
    const latDiff = Math.abs(currentLocation.lat - birthLocation.lat);
    const lngDiff = Math.abs(currentLocation.lng - birthLocation.lng);

    const latHarmonic = Math.sin((latDiff * Math.PI) / 180);
    const lngHarmonic = Math.sin((lngDiff * Math.PI) / 180);

    const regionLatHarmonic = Math.sin((regionSeed.lat * Math.PI) / 180);
    const regionLngHarmonic = Math.cos((regionSeed.lng * Math.PI) / 180);

    return (latHarmonic + lngHarmonic + regionLatHarmonic + regionLngHarmonic) / 4;
  }

  private static calculateTransitInfluence(
    natalChart: NatalChart,
    currentTransits: { sunDegree: number; moonDegree: number; moonPhase: number },
    gaaState: GAAState
  ): {
    intensity: number;
    harmonicResonance: number;
    activatedHouses: number[];
  } {
    const natalSunDegree = this.signToDegree(natalChart.sun.sign) + natalChart.sun.degree;
    const natalMoonDegree = this.signToDegree(natalChart.moon.sign) + natalChart.moon.degree;

    const sunAspect = this.calculateAspect(natalSunDegree, currentTransits.sunDegree);
    const moonAspect = this.calculateAspect(natalMoonDegree, currentTransits.moonDegree);

    const intensity = (sunAspect.strength + moonAspect.strength) / 2;

    const harmonicResonance = Math.abs(Math.sin(currentTransits.moonPhase * 2 * Math.PI)) * gaaState.phase;

    const activatedHouses: number[] = [];
    const transitSunHouse = Math.floor(currentTransits.sunDegree / 30) + 1;
    const transitMoonHouse = Math.floor(currentTransits.moonDegree / 30) + 1;
    activatedHouses.push(transitSunHouse, transitMoonHouse);

    return {
      intensity,
      harmonicResonance,
      activatedHouses
    };
  }

  private static calculateAspect(degree1: number, degree2: number): { strength: number; type: string } {
    let diff = Math.abs(degree1 - degree2);
    if (diff > 180) diff = 360 - diff;

    const aspects = [
      { angle: 0, name: 'conjunction', strength: 1.0, orb: 8 },
      { angle: 60, name: 'sextile', strength: 0.6, orb: 6 },
      { angle: 90, name: 'square', strength: 0.8, orb: 7 },
      { angle: 120, name: 'trine', strength: 0.9, orb: 8 },
      { angle: 180, name: 'opposition', strength: 0.85, orb: 8 }
    ];

    for (const aspect of aspects) {
      const orb = Math.abs(diff - aspect.angle);
      if (orb <= aspect.orb) {
        const strength = aspect.strength * (1 - orb / aspect.orb);
        return { strength, type: aspect.name };
      }
    }

    return { strength: 0.2, type: 'none' };
  }

  private static signToDegree(sign: string): number {
    const signs = [
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ];
    return signs.indexOf(sign) * 30;
  }

  private static calculateGAAAlignment(
    astroSignature: AstrologicalSignature,
    gaaState: GAAState
  ): {
    personalFrequency: number;
    harmonicRatio: number;
    phaseSync: number;
  } {
    const elementFrequencies: Record<string, number> = {
      fire: 432 * 1.5,
      earth: 432 * 1.0,
      air: 432 * 1.25,
      water: 432 * 0.75
    };

    const personalFrequency = elementFrequencies[astroSignature.dominantElement];

    const harmonicRatio = personalFrequency / 432;

    const chartPhase = (this.signToDegree(astroSignature.natalChart.sun.sign) +
                         astroSignature.natalChart.sun.degree) / 360;

    const phaseSync = 1.0 - Math.abs(chartPhase - gaaState.phase);

    return {
      personalFrequency,
      harmonicRatio,
      phaseSync
    };
  }

  private static calculateTemporalCoherence(
    birthDate: Date,
    currentTimestamp: number,
    gaaState: GAAState
  ): number {
    const birthTime = birthDate.getTime();
    const ageMs = currentTimestamp - birthTime;
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);

    const saturnCycle = (ageYears % 29.5) / 29.5;
    const jupiterCycle = (ageYears % 12) / 12;

    const cosmicPhase = (saturnCycle + jupiterCycle) / 2;

    const temporalAlignment = 1.0 - Math.abs(cosmicPhase - gaaState.phase);

    return temporalAlignment * gaaState.lfo;
  }

  private static calculateMultidimensionalDepth(
    astroSignature: AstrologicalSignature,
    locationResonance: number,
    transitInfluence: { intensity: number; harmonicResonance: number },
    gaaAlignment: { harmonicRatio: number; phaseSync: number }
  ): number {
    const aspectDensity = astroSignature.aspects.length / 20;

    const elementBalance = Math.min(
      astroSignature.elementBalance.fire,
      astroSignature.elementBalance.earth,
      astroSignature.elementBalance.air,
      astroSignature.elementBalance.water
    ) * 4;

    const depth = (
      aspectDensity * 0.25 +
      elementBalance * 0.20 +
      locationResonance * 0.20 +
      transitInfluence.intensity * 0.15 +
      transitInfluence.harmonicResonance * 0.10 +
      gaaAlignment.phaseSync * 0.10
    );

    return Math.min(depth, 1.0);
  }

  private static calculateGroupSynastry(
    currentSignature: AstrologicalParticipantSignature,
    existingParticipants: CosmicSignature[]
  ): Map<string, {
    compatibility: number;
    connectionType: string;
    visualIntensity: number;
    aspectColors: [number, number, number][];
  }> {
    const synastryMap = new Map();

    for (const other of existingParticipants) {
      const result = AstrologicalEncoder.calculateSynastry(currentSignature, other);

      let connectionType = 'harmonic';
      if (result.compatibility > 0.8) connectionType = 'resonant';
      else if (result.compatibility < 0.4) connectionType = 'tension';
      else if (result.elementHarmony > 0.7) connectionType = 'flowing';

      const visualIntensity = result.compatibility * 0.7 + result.elementHarmony * 0.3;

      const aspectColors: [number, number, number][] = [];
      currentSignature.aspects.forEach(aspect => {
        if (aspect.strength > 0.5) {
          aspectColors.push(aspect.color);
        }
      });

      synastryMap.set(other.id, {
        compatibility: result.compatibility,
        connectionType,
        visualIntensity,
        aspectColors: aspectColors.slice(0, 3)
      });
    }

    return synastryMap;
  }

  static calculateCollectiveCosmicField(signatures: CosmicSignature[]): {
    dominantElement: string;
    averageLocationResonance: number;
    totalTransitIntensity: number;
    gaaHarmonicCenter: number;
    temporalCoherence: number;
    collectiveDepth: number;
    synergyScore: number;
  } {
    if (signatures.length === 0) {
      return {
        dominantElement: 'balanced',
        averageLocationResonance: 0,
        totalTransitIntensity: 0,
        gaaHarmonicCenter: 1.0,
        temporalCoherence: 0,
        collectiveDepth: 0,
        synergyScore: 0
      };
    }

    const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
    let totalLocationResonance = 0;
    let totalTransitIntensity = 0;
    let totalGaaRatio = 0;
    let totalTemporalCoherence = 0;
    let totalDepth = 0;

    signatures.forEach(sig => {
      elementCounts[sig.astrology.element]++;
      totalLocationResonance += sig.cosmic.locationResonance;
      totalTransitIntensity += sig.cosmic.transitInfluence.intensity;
      totalGaaRatio += sig.cosmic.gaaAlignment.harmonicRatio;
      totalTemporalCoherence += sig.cosmic.temporalCoherence;
      totalDepth += sig.cosmic.multidimensionalDepth;
    });

    const count = signatures.length;
    const dominantElement = Object.entries(elementCounts)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    let totalSynergy = 0;
    let synergyCount = 0;
    signatures.forEach(sig => {
      sig.synastry.forEach(connection => {
        totalSynergy += connection.compatibility;
        synergyCount++;
      });
    });

    return {
      dominantElement,
      averageLocationResonance: totalLocationResonance / count,
      totalTransitIntensity: totalTransitIntensity / count,
      gaaHarmonicCenter: totalGaaRatio / count,
      temporalCoherence: totalTemporalCoherence / count,
      collectiveDepth: totalDepth / count,
      synergyScore: synergyCount > 0 ? totalSynergy / synergyCount : 0.5
    };
  }
}
