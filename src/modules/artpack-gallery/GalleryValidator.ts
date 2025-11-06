import type { ArtPackManifest } from '../artpacks/types';
import type { ValidationResult, SafetyReport } from './types';

export class GalleryValidator {
  static async validateManifest(manifest: any): Promise<ValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!manifest.id || typeof manifest.id !== 'string') {
      errors.push('Missing or invalid "id" field');
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push('Missing or invalid "name" field');
    }

    if (!manifest.version || !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('Missing or invalid "version" field (must be semver)');
    }

    if (!manifest.entry || typeof manifest.entry !== 'string') {
      errors.push('Missing or invalid "entry" field');
    }

    if (!manifest.minEngine || typeof manifest.minEngine !== 'string') {
      errors.push('Missing or invalid "minEngine" field');
    }

    if (!manifest.author || typeof manifest.author !== 'string') {
      warnings.push('Missing "author" field recommended for attribution');
    }

    if (!manifest.license) {
      warnings.push('Missing "license" field - defaulting to MIT');
    }

    if (!manifest.safety) {
      warnings.push('Missing "safety" section - using default safety caps');
    } else {
      if (manifest.safety.maxStrobeHz && manifest.safety.maxStrobeHz > 3) {
        errors.push(`Unsafe strobe rate: ${manifest.safety.maxStrobeHz}Hz exceeds safe limit of 3Hz`);
      }

      if (manifest.safety.photosensitiveWarning === true) {
        warnings.push('Pack declares photosensitive content warning');
      }
    }

    const safetyReport: SafetyReport = {
      valid: errors.length === 0,
      warnings,
      errors,
      checks: {
        strobeRate: {
          passed: !manifest.safety?.maxStrobeHz || manifest.safety.maxStrobeHz <= 3,
          value: manifest.safety?.maxStrobeHz || 0
        }
      },
      timestamp: new Date().toISOString()
    };

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      safetyReport
    };
  }

  static async validateShaderCode(shaderCode: string): Promise<ValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    const highFreqPattern = /sin\s*\(\s*[^)]*\*\s*([0-9]+\.?[0-9]*)\s*\)/g;
    const matches = [...shaderCode.matchAll(highFreqPattern)];

    for (const match of matches) {
      const frequency = parseFloat(match[1]);
      if (frequency > 10) {
        warnings.push(`High-frequency oscillation detected: ${frequency}Hz may cause strobing`);
      }
    }

    const brightCheck = /vec[34]\s*\(\s*([0-9]+\.?[0-9]*)\s*,\s*([0-9]+\.?[0-9]*)\s*,\s*([0-9]+\.?[0-9]*)/g;
    const brightMatches = [...shaderCode.matchAll(brightCheck)];

    for (const match of brightMatches) {
      const r = parseFloat(match[1]);
      const g = parseFloat(match[2]);
      const b = parseFloat(match[3]);

      if (r > 1.5 || g > 1.5 || b > 1.5) {
        warnings.push('Extremely bright color values detected (>1.5) - may be uncomfortable');
      }
    }

    const redFlashPattern = /vec[34]\s*\(\s*1\.0\s*,\s*0\.0\s*,\s*0\.0/g;
    if (redFlashPattern.test(shaderCode)) {
      warnings.push('Pure saturated red detected - can trigger photosensitive reactions');
    }

    const rapidColorChange = /mod\s*\([^)]*time[^)]*,\s*([0-9]+\.?[0-9]*)\s*\)/g;
    const modMatches = [...shaderCode.matchAll(rapidColorChange)];

    for (const match of modMatches) {
      const period = parseFloat(match[1]);
      if (period < 0.5) {
        warnings.push(`Rapid color cycling detected (period: ${period}s) - may cause discomfort`);
      }
    }

    const contrastFlashDetected = /abs\s*\(\s*sin\s*\([^)]*\)\s*\)\s*>\s*0\.[89][0-9]/.test(shaderCode);
    if (contrastFlashDetected) {
      warnings.push('High-contrast flashing pattern detected');
    }

    const safetyReport: SafetyReport = {
      valid: errors.length === 0,
      warnings,
      errors,
      checks: {
        strobeRate: {
          passed: warnings.filter(w => w.includes('frequency')).length === 0
        },
        brightness: {
          passed: warnings.filter(w => w.includes('bright')).length === 0,
          value: 0
        },
        contrastFlash: {
          passed: !contrastFlashDetected
        },
        saturatedRed: {
          passed: !redFlashPattern.test(shaderCode)
        }
      },
      timestamp: new Date().toISOString()
    };

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      safetyReport
    };
  }

  static async validatePackArchive(file: File): Promise<ValidationResult> {
    const warnings: string[] = [];
    const errors: string[] = [];

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds 10MB limit`);
    }

    if (!file.name.endsWith('.zip')) {
      errors.push('File must be a ZIP archive');
    }

    const safetyReport: SafetyReport = {
      valid: errors.length === 0,
      warnings,
      errors,
      checks: {},
      timestamp: new Date().toISOString()
    };

    return {
      valid: errors.length === 0,
      warnings,
      errors,
      safetyReport
    };
  }

  static async validateCompletePackage(
    manifest: ArtPackManifest,
    shaderCode?: string
  ): Promise<ValidationResult> {
    const manifestResult = await this.validateManifest(manifest);
    const shaderResult = shaderCode
      ? await this.validateShaderCode(shaderCode)
      : { valid: true, warnings: [], errors: [], safetyReport: {} as SafetyReport };

    const combinedWarnings = [...manifestResult.warnings, ...shaderResult.warnings];
    const combinedErrors = [...manifestResult.errors, ...shaderResult.errors];

    const safetyReport: SafetyReport = {
      valid: combinedErrors.length === 0,
      warnings: combinedWarnings,
      errors: combinedErrors,
      checks: {
        ...manifestResult.safetyReport.checks,
        ...shaderResult.safetyReport.checks
      },
      timestamp: new Date().toISOString()
    };

    return {
      valid: combinedErrors.length === 0,
      warnings: combinedWarnings,
      errors: combinedErrors,
      safetyReport
    };
  }

  static getSafetyScore(report: SafetyReport): number {
    const checks = Object.values(report.checks);
    if (checks.length === 0) return 0;

    const passed = checks.filter(check => check && check.passed).length;
    const score = (passed / checks.length) * 100;

    const warningPenalty = Math.min(report.warnings.length * 5, 30);
    const errorPenalty = report.errors.length * 20;

    return Math.max(0, Math.min(100, score - warningPenalty - errorPenalty));
  }

  static getSafetyLabel(score: number): { label: string; color: string } {
    if (score >= 90) return { label: 'Excellent', color: 'green' };
    if (score >= 75) return { label: 'Good', color: 'blue' };
    if (score >= 60) return { label: 'Fair', color: 'yellow' };
    if (score >= 40) return { label: 'Caution', color: 'orange' };
    return { label: 'Warning', color: 'red' };
  }
}

export async function computeChecksum(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
