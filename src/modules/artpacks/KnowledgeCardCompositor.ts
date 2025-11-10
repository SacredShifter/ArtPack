/**
 * Canvas compositor for adding knowledge cards to consciousness artifacts
 */

export interface CompositorOptions {
  knowledgeText: string;
  overlayOpacity?: number;
  padding?: number;
  fontSize?: number;
  lineHeight?: number;
}

export class KnowledgeCardCompositor {
  /**
   * Composites a knowledge card onto a canvas
   * @param sourceCanvas The original canvas to composite
   * @param options Knowledge card options
   * @returns Blob of the composited image
   */
  static async composite(
    sourceCanvas: HTMLCanvasElement,
    options: CompositorOptions
  ): Promise<Blob> {
    const {
      knowledgeText,
      overlayOpacity = 0.92,
      padding = 40,
      fontSize = 14,
      lineHeight = 1.6
    } = options;

    // Create temporary canvas for compositing
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    canvas.width = sourceCanvas.width;
    canvas.height = sourceCanvas.height;

    // Draw original content
    ctx.drawImage(sourceCanvas, 0, 0);

    // Calculate overlay dimensions (bottom 35% of canvas)
    const overlayHeight = canvas.height * 0.35;
    const overlayY = canvas.height - overlayHeight;

    // Draw refined overlay with gradient wash
    const gradient = ctx.createLinearGradient(0, overlayY, 0, canvas.height);
    gradient.addColorStop(0, `rgba(6, 8, 12, ${overlayOpacity * 0.75})`);
    gradient.addColorStop(0.4, `rgba(10, 12, 16, ${overlayOpacity * 0.92})`);
    gradient.addColorStop(1, `rgba(8, 10, 14, ${overlayOpacity * 0.96})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);

    // Add refined border with subtle glow
    const borderGradient = ctx.createLinearGradient(0, overlayY - 1, 0, overlayY + 3);
    borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.28)');
    borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.08)');

    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, overlayY);
    ctx.lineTo(canvas.width, overlayY);
    ctx.stroke();

    // Render knowledge text
    this.renderKnowledgeText(ctx, knowledgeText, {
      x: padding,
      y: overlayY + padding,
      width: canvas.width - (padding * 2),
      height: overlayHeight - (padding * 2),
      fontSize,
      lineHeight
    });

    // Convert to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 1.0);
    });
  }

  private static renderKnowledgeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    layout: {
      x: number;
      y: number;
      width: number;
      height: number;
      fontSize: number;
      lineHeight: number;
    }
  ) {
    const lines = text.split('\n');
    let currentY = layout.y;

    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    for (const line of lines) {
      if (currentY > layout.y + layout.height) break;

      // Style based on line content with refined hierarchy
      if (line.match(/^[A-Z\s]{10,}$/)) {
        // ALL CAPS HEADERS - Maximum prestige
        ctx.font = `700 ${layout.fontSize * 1.25}px "Inter", -apple-system, system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
        ctx.letterSpacing = '0.15em';
        // Add subtle text shadow for depth
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 2;
        ctx.shadowOffsetY = 1;
      } else if (line.includes('━━━')) {
        // Separator line with refined styling
        const separatorY = currentY + (layout.fontSize * layout.lineHeight / 2);
        const sepGradient = ctx.createLinearGradient(layout.x, 0, layout.x + layout.width, 0);
        sepGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        sepGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.22)');
        sepGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = sepGradient;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(layout.x, separatorY);
        ctx.lineTo(layout.x + layout.width, separatorY);
        ctx.stroke();
        currentY += layout.fontSize * layout.lineHeight * 0.8;
        continue;
      } else if (line.startsWith('Captured •') || line.startsWith('The Unseen Series')) {
        // Metadata and branding - subtle
        ctx.font = `400 ${layout.fontSize * 0.9}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.letterSpacing = '0.05em';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      } else if (line.includes(':')) {
        // Key-value pairs - Consciousness State metrics
        ctx.font = `500 ${layout.fontSize}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.90)';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      } else if (line.match(/^(ESSENCE|VISUAL ELEMENTS|REVELATION|FOUNDATION)$/)) {
        // Section headers - prestigious
        ctx.font = `600 ${layout.fontSize * 1.05}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.letterSpacing = '0.12em';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      } else {
        // Body text - clean, readable
        ctx.font = `400 ${layout.fontSize}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }

      // Word wrap long lines
      const wrappedLines = this.wrapText(ctx, line, layout.width);

      for (const wrappedLine of wrappedLines) {
        if (currentY > layout.y + layout.height) break;

        ctx.fillText(wrappedLine, layout.x, currentY);
        currentY += layout.fontSize * layout.lineHeight;
      }
    }
  }

  private static wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    if (ctx.measureText(text).width <= maxWidth) {
      return [text];
    }

    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Generates a preview of what the knowledge card will look like
   * (useful for showing before download)
   */
  static generatePreview(
    sourceCanvas: HTMLCanvasElement,
    options: CompositorOptions
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Scale down for preview (max 800px wide)
    const scale = Math.min(1, 800 / sourceCanvas.width);
    canvas.width = sourceCanvas.width * scale;
    canvas.height = sourceCanvas.height * scale;

    ctx.scale(scale, scale);
    ctx.drawImage(sourceCanvas, 0, 0);

    // Same overlay logic as composite
    const overlayHeight = sourceCanvas.height * 0.35;
    const overlayY = sourceCanvas.height - overlayHeight;

    const gradient = ctx.createLinearGradient(0, overlayY, 0, sourceCanvas.height);
    gradient.addColorStop(0, `rgba(10, 10, 15, ${options.overlayOpacity || 0.92})`);
    gradient.addColorStop(1, `rgba(10, 10, 15, ${options.overlayOpacity || 0.92})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, sourceCanvas.width, overlayHeight);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, overlayY);
    ctx.lineTo(sourceCanvas.width, overlayY);
    ctx.stroke();

    // Simplified text preview
    ctx.font = '12px monospace';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('Knowledge Card Preview...', 20, overlayY + 20);

    return canvas;
  }
}
