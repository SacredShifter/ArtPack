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

    // Draw semi-transparent overlay
    const gradient = ctx.createLinearGradient(0, overlayY, 0, canvas.height);
    gradient.addColorStop(0, `rgba(10, 10, 15, ${overlayOpacity * 0.85})`);
    gradient.addColorStop(1, `rgba(10, 10, 15, ${overlayOpacity})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, overlayY, canvas.width, overlayHeight);

    // Add subtle top border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
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

      // Style based on line content
      if (line.match(/^[A-Z\s]{10,}$/)) {
        // ALL CAPS HEADERS
        ctx.font = `bold ${layout.fontSize * 1.2}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.letterSpacing = '0.1em';
      } else if (line.includes('━━━')) {
        // Separator line
        const separatorY = currentY + (layout.fontSize * layout.lineHeight / 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(layout.x, separatorY);
        ctx.lineTo(layout.x + layout.width, separatorY);
        ctx.stroke();
        currentY += layout.fontSize * layout.lineHeight;
        continue;
      } else if (line.startsWith('•')) {
        // Bullet points
        ctx.font = `${layout.fontSize}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      } else if (line.startsWith('  →')) {
        // Symbolism indent
        ctx.font = `italic ${layout.fontSize * 0.95}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(200, 220, 255, 0.75)';
      } else if (line.startsWith('  ')) {
        // Regular indent
        ctx.font = `${layout.fontSize * 0.95}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      } else if (line.includes(':')) {
        // Key-value pairs
        ctx.font = `${layout.fontSize}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      } else {
        // Body text
        ctx.font = `${layout.fontSize}px "Inter", system-ui, sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
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
