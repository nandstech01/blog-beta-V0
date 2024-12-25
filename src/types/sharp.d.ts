declare module 'sharp' {
  interface SharpOptions {
    failOnError?: boolean;
    density?: number;
    page?: number;
    pages?: number;
    animated?: boolean;
    limitInputPixels?: number;
  }

  interface ResizeOptions {
    width?: number;
    height?: number;
    fit?: 'contain' | 'cover' | 'fill' | 'inside' | 'outside';
    position?: string | number;
    background?: string | object;
    kernel?: string;
    withoutEnlargement?: boolean;
    withoutReduction?: boolean;
    fastShrinkOnLoad?: boolean;
  }

  interface OutputOptions {
    quality?: number;
    progressive?: boolean;
    compressionLevel?: number;
    force?: boolean;
  }

  interface Sharp {
    (input?: string | Buffer, options?: SharpOptions): Sharp;
    resize(width?: number, height?: number, options?: ResizeOptions): Sharp;
    toBuffer(options?: OutputOptions): Promise<Buffer>;
    toFile(path: string, options?: OutputOptions): Promise<void>;
    metadata(): Promise<{
      format?: string;
      width?: number;
      height?: number;
      channels?: number;
      premultiplied?: boolean;
      size?: number;
    }>;
  }

  const sharp: Sharp;
  export = sharp;
} 