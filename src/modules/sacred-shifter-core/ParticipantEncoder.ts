export interface ParticipantIdentity {
  id: string;
  name?: string;
  initials?: string;
  joinedAt: number;
  role: 'viewer' | 'contributor' | 'co-creator';
  personalCoherence?: number;
  colorPreference?: string;
}

export interface ParticipantSignature {
  id: string;
  seedValue: number;
  colorHue: number;
  colorSat: number;
  colorLight: number;
  phaseOffset: number;
  positionAngle: number;
  positionRadius: number;
  amplitude: number;
  rotationSpeed: number;
  geometryType: 'point' | 'glyph' | 'mandala' | 'field';
  blendWeight: number;
}

export class ParticipantEncoder {
  private static stringToSeed(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private static goldenAngle = 137.508;

  static encode(identity: ParticipantIdentity, totalParticipants: number, participantIndex: number): ParticipantSignature {
    const nameSeed = this.stringToSeed(identity.name || identity.id);
    const idSeed = this.stringToSeed(identity.id);

    const hue = (nameSeed % 360);
    const sat = 0.6 + ((idSeed % 40) / 100);
    const light = 0.5 + ((nameSeed % 30) / 100);

    const phaseOffset = (identity.joinedAt % 10000) / 10000;

    const positionAngle = (participantIndex * this.goldenAngle) % 360;
    const positionRadius = 0.3 + (participantIndex / totalParticipants) * 0.6;

    const amplitude = identity.personalCoherence || 0.7;

    const rotationSpeed = 0.5 + ((nameSeed % 100) / 100);

    let geometryType: ParticipantSignature['geometryType'] = 'point';
    if (totalParticipants <= 50) {
      geometryType = identity.role === 'co-creator' ? 'mandala' : 'glyph';
    } else if (totalParticipants <= 1000) {
      geometryType = 'glyph';
    } else {
      geometryType = 'point';
    }

    const blendWeight = 1.0 / Math.sqrt(totalParticipants);

    return {
      id: identity.id,
      seedValue: nameSeed,
      colorHue: hue,
      colorSat: sat,
      colorLight: light,
      phaseOffset,
      positionAngle,
      positionRadius,
      amplitude,
      rotationSpeed,
      geometryType,
      blendWeight
    };
  }

  static encodeInitialsToGlyph(initials: string): number[] {
    const glyphData: number[] = [];

    for (let i = 0; i < initials.length; i++) {
      const charCode = initials.charCodeAt(i);
      const normalizedValue = (charCode - 65) / 26;
      glyphData.push(normalizedValue);
    }

    while (glyphData.length < 3) {
      glyphData.push(0.5);
    }

    return glyphData.slice(0, 3);
  }

  static generateCollectiveStats(signatures: ParticipantSignature[]): {
    totalEnergy: number;
    avgCoherence: number;
    dominantHue: number;
    centerOfMass: [number, number];
    diversityIndex: number;
  } {
    if (signatures.length === 0) {
      return {
        totalEnergy: 0,
        avgCoherence: 0,
        dominantHue: 0,
        centerOfMass: [0, 0],
        diversityIndex: 0
      };
    }

    const totalEnergy = signatures.reduce((sum, sig) => sum + sig.amplitude, 0);
    const avgCoherence = totalEnergy / signatures.length;

    const hueHistogram = new Array(12).fill(0);
    signatures.forEach(sig => {
      const bin = Math.floor(sig.colorHue / 30);
      hueHistogram[bin]++;
    });
    const dominantBin = hueHistogram.indexOf(Math.max(...hueHistogram));
    const dominantHue = dominantBin * 30 + 15;

    let centerX = 0;
    let centerY = 0;
    signatures.forEach(sig => {
      const angle = (sig.positionAngle * Math.PI) / 180;
      centerX += Math.cos(angle) * sig.positionRadius * sig.amplitude;
      centerY += Math.sin(angle) * sig.positionRadius * sig.amplitude;
    });
    centerX /= signatures.length;
    centerY /= signatures.length;

    const uniqueHues = new Set(signatures.map(sig => Math.floor(sig.colorHue / 10)));
    const diversityIndex = uniqueHues.size / 36;

    return {
      totalEnergy,
      avgCoherence,
      dominantHue,
      centerOfMass: [centerX, centerY],
      diversityIndex
    };
  }
}
