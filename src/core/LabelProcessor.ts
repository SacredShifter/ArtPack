import type { ModuleManifest } from './types';

export class LabelProcessor {
  private static instance: LabelProcessor;

  private labelSemantics: Map<string, string[]> = new Map([
    ['visual', ['experiential', 'rendering', 'artistic', 'perceptual']],
    ['coherence', ['biometric', 'synchronization', 'harmony', 'alignment']],
    ['transcendence', ['peak-state', 'mystical', 'spiritual', 'expanded']],
    ['meditative', ['calming', 'centering', 'mindful', 'present']],
    ['creative', ['generative', 'artistic', 'expressive', 'innovative']],
    ['safety-conscious', ['protective', 'accessible', 'gentle', 'responsible']],
    ['community', ['social', 'shared', 'collective', 'collaborative']],
    ['orchestration', ['coordination', 'sequencing', 'adaptive', 'intelligent']],
    ['real-time', ['live', 'responsive', 'immediate', 'dynamic']]
  ]);

  private telosSemantics: Map<string, string[]> = new Map([
    ['facilitate-transcendence', ['expand-consciousness', 'mystical-experience', 'ego-dissolution']],
    ['enable-creative-expression', ['unlock-creativity', 'artistic-flow', 'generative-play']],
    ['support-meditative-states', ['calm-mind', 'present-moment', 'inner-peace']],
    ['process-shadow', ['integrate-darkness', 'emotional-healing', 'face-fears']],
    ['celebrate-joy', ['amplify-happiness', 'playful-energy', 'gratitude']],
    ['enhance-collective-field', ['group-coherence', 'shared-experience', 'unity-consciousness']],
    ['guide-ceremonial-experiences', ['ritual-support', 'sacred-journey', 'intentional-passage']]
  ]);

  private constructor() {}

  static getInstance(): LabelProcessor {
    if (!LabelProcessor.instance) {
      LabelProcessor.instance = new LabelProcessor();
    }
    return LabelProcessor.instance;
  }

  calculateLabelSimilarity(labels1: string[], labels2: string[]): number {
    if (labels1.length === 0 || labels2.length === 0) return 0;

    let matchScore = 0;
    const totalComparisons = labels1.length * labels2.length;

    labels1.forEach(label1 => {
      labels2.forEach(label2 => {
        if (label1 === label2) {
          matchScore += 10;
        } else if (this.areLabelsRelated(label1, label2)) {
          matchScore += 5;
        }
      });
    });

    return Math.min((matchScore / totalComparisons) * 100, 100);
  }

  areLabelsRelated(label1: string, label2: string): boolean {
    const semantics1 = this.labelSemantics.get(label1) || [];
    const semantics2 = this.labelSemantics.get(label2) || [];

    if (semantics1.includes(label2) || semantics2.includes(label1)) {
      return true;
    }

    return semantics1.some(s => semantics2.includes(s));
  }

  findModulesByLabel(
    modules: ModuleManifest[],
    requiredLabels: string[],
    minSimilarity: number = 50
  ): ModuleManifest[] {
    return modules
      .map(module => ({
        module,
        similarity: this.calculateLabelSimilarity(module.essenceLabels, requiredLabels)
      }))
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .map(result => result.module);
  }

  findModulesByTelos(
    modules: ModuleManifest[],
    userTelos: string[],
    minAlignment: number = 50
  ): ModuleManifest[] {
    return modules
      .map(module => ({
        module,
        alignment: this.calculateTelosAlignment(module.telosAlignment, userTelos)
      }))
      .filter(result => result.alignment >= minAlignment)
      .sort((a, b) => b.alignment - a.alignment)
      .map(result => result.module);
  }

  calculateTelosAlignment(moduleTelos: string[], userTelos: string[]): number {
    if (moduleTelos.length === 0 || userTelos.length === 0) return 0;

    let alignmentScore = 0;
    const totalComparisons = moduleTelos.length * userTelos.length;

    moduleTelos.forEach(mt => {
      userTelos.forEach(ut => {
        if (mt === ut) {
          alignmentScore += 10;
        } else if (this.areTelosRelated(mt, ut)) {
          alignmentScore += 6;
        }
      });
    });

    return Math.min((alignmentScore / totalComparisons) * 100, 100);
  }

  areTelosRelated(telos1: string, telos2: string): boolean {
    const semantics1 = this.telosSemantics.get(telos1) || [];
    const semantics2 = this.telosSemantics.get(telos2) || [];

    if (semantics1.includes(telos2) || semantics2.includes(telos1)) {
      return true;
    }

    return semantics1.some(s => semantics2.includes(s));
  }

  detectDissonance(manifest: ModuleManifest): {
    isDissonant: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (manifest.integrityScore < 50) {
      issues.push('Integrity score critically low');
    }

    if (manifest.essenceLabels.length === 0) {
      issues.push('No essence labels defined');
    }

    if (manifest.capabilities.length === 0) {
      issues.push('No capabilities declared');
    }

    if (manifest.telosAlignment.length === 0) {
      issues.push('No telos alignment declared');
    }

    const labelCapabilityCoherence = this.checkLabelCapabilityCoherence(
      manifest.essenceLabels,
      manifest.capabilities
    );

    if (!labelCapabilityCoherence) {
      issues.push('Essence labels do not align with declared capabilities');
    }

    return {
      isDissonant: issues.length > 0,
      issues
    };
  }

  private checkLabelCapabilityCoherence(labels: string[], capabilities: string[]): boolean {
    if (labels.includes('visual') && !capabilities.some(c => c.includes('render') || c.includes('visual'))) {
      return false;
    }

    if (labels.includes('biometric') && !capabilities.some(c => c.includes('biometric') || c.includes('sensor'))) {
      return false;
    }

    return true;
  }

  expandLabel(label: string): string[] {
    return [label, ...(this.labelSemantics.get(label) || [])];
  }

  expandTelos(telos: string): string[] {
    return [telos, ...(this.telosSemantics.get(telos) || [])];
  }
}

export const labelProcessor = LabelProcessor.getInstance();
