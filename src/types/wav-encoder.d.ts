// wav-encoder.d.ts
declare module "wav-encoder" {
    interface EncodeOptions {
      sampleRate: number;
      channelData: Float32Array[];
    }
  
    interface WavEncoder {
      encode: (options: EncodeOptions) => Promise<Uint8Array>;
    }
  
    const wavEncoder: WavEncoder;
    export = wavEncoder;
  }