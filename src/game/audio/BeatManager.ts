export type BeatCallback = (beatNumber: number, time: number) => void;

export class BeatManager {
  bpm: number = 140;
  songOffset: number = 0; // in seconds

  private lastBeatIndex: number = -1;
  private lastHalfBeatIndex: number = -1;
  private lastMeasureIndex: number = -1;

  private onBeatCallbacks: BeatCallback[] = [];
  private onHalfBeatCallbacks: BeatCallback[] = [];
  private onMeasureCallbacks: BeatCallback[] = [];

  constructor(bpm: number = 140, offset: number = 0) {
    this.bpm = bpm;
    this.songOffset = offset;
  }

  setBpm(bpm: number): void {
    this.bpm = bpm;
  }

  reset(): void {
    this.lastBeatIndex = -1;
    this.lastHalfBeatIndex = -1;
    this.lastMeasureIndex = -1;
  }

  get beatDuration(): number {
    return 60 / this.bpm;
  }

  update(audioTime: number): {
    isBeat: boolean;
    isHalfBeat: boolean;
    isMeasure: boolean;
    beatProgress: number; // 0.0 to 1.0 within current beat
    beatIntensity: number; // 1.0 on beat, decaying to 0.0
  } {
    const adjustedTime = Math.max(0, audioTime - this.songOffset);
    const duration = this.beatDuration;

    const currentBeatFloat = adjustedTime / duration;
    const currentBeatIndex = Math.floor(currentBeatFloat);
    const currentHalfBeatIndex = Math.floor(adjustedTime / (duration / 2));
    const currentMeasureIndex = Math.floor(adjustedTime / (duration * 4));

    let isBeat = false;
    let isHalfBeat = false;
    let isMeasure = false;

    if (currentBeatIndex > this.lastBeatIndex) {
      this.lastBeatIndex = currentBeatIndex;
      isBeat = true;
      this.onBeatCallbacks.forEach((cb) => cb(currentBeatIndex, audioTime));
    }

    if (currentHalfBeatIndex > this.lastHalfBeatIndex) {
      this.lastHalfBeatIndex = currentHalfBeatIndex;
      isHalfBeat = true;
      this.onHalfBeatCallbacks.forEach((cb) => cb(currentHalfBeatIndex, audioTime));
    }

    if (currentMeasureIndex > this.lastMeasureIndex) {
      this.lastMeasureIndex = currentMeasureIndex;
      isMeasure = true;
      this.onMeasureCallbacks.forEach((cb) => cb(currentMeasureIndex, audioTime));
    }

    const beatProgress = currentBeatFloat - currentBeatIndex;
    // Exponential decay from 1.0 down to 0 for punchy visual bounce
    const beatIntensity = Math.max(0, Math.pow(1 - beatProgress, 2.5));

    return {
      isBeat,
      isHalfBeat,
      isMeasure,
      beatProgress,
      beatIntensity,
    };
  }

  onBeat(cb: BeatCallback): void {
    this.onBeatCallbacks.push(cb);
  }

  onHalfBeat(cb: BeatCallback): void {
    this.onHalfBeatCallbacks.push(cb);
  }

  onMeasure(cb: BeatCallback): void {
    this.onMeasureCallbacks.push(cb);
  }
}
