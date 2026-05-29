import * as THREE from 'three';

interface NarrationConfig {
  voiceName?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
}

interface QueuedNarration {
  text: string;
  priority: 'high' | 'normal' | 'low';
  onComplete?: () => void;
}

export class NarrationManager {
  private synth: SpeechSynthesis;
  private voice: SpeechSynthesisVoice | null = null;
  private config: Required<NarrationConfig>;
  private queue: QueuedNarration[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private enabled = true;
  private lastStepIndex = -1;
  
  constructor(config: NarrationConfig = {}) {
    this.synth = window.speechSynthesis;
    this.config = {
      voiceName: config.voiceName ?? '',
      rate: config.rate ?? 1.0,
      pitch: config.pitch ?? 1.0,
      volume: config.volume ?? 0.85,
      language: config.language ?? 'en-US',
    };
    
    this._initVoice();
  }
  
  /** Initialize the voice — try to match avatar's preferred voice */
  private _initVoice() {
    // Voices may load asynchronously
    const tryLoad = () => {
      const voices = this.synth.getVoices();
      if (voices.length === 0) {
        setTimeout(tryLoad, 200);
        return;
      }
      
      // ── Priority order for voice selection ──
      // 1. Exact name match (if specified)
      // 2. High-quality English voices (Google, Microsoft, Apple premium)
      // 3. Any English voice
      // 4. Default voice
      
      const preferred = [
        this.config.voiceName,                                     // user-specified
        'Google US English',                                       // Chrome
        'Microsoft Aria Online (Natural) - English (United States)', // Edge premium
        'Microsoft Jenny Online (Natural) - English (United States)',
        'Microsoft Guy Online (Natural) - English (United States)',
        'Samantha',                                                // macOS / iOS
        'Karen',                                                   // macOS
        'Daniel',                                                  // macOS
      ].filter(Boolean);
      
      for (const name of preferred) {
        const found = voices.find((v) => v.name === name);
        if (found) {
          this.voice = found;
          console.log('[NARRATION] Using voice:', found.name);
          return;
        }
      }
      
      // Fallback: any English voice that sounds natural
      this.voice = voices.find((v) => 
        v.lang.startsWith('en') &&
        (v.name.includes('Natural') || v.name.includes('Premium') || v.name.includes('Enhanced'))
      ) || voices.find((v) => v.lang.startsWith('en')) || voices[0];
      
      console.log('[NARRATION] Fallback voice:', this.voice?.name);
    };
    
    if (this.synth.getVoices().length > 0) {
      tryLoad();
    } else {
      this.synth.onvoiceschanged = tryLoad;
    }
  }
  
  /** Queue a narration to be spoken */
  public speak(text: string, priority: 'high' | 'normal' | 'low' = 'normal', onComplete?: () => void) {
    if (!this.enabled) {
      onComplete?.();
      return;
    }
    
    if (priority === 'high') {
      // High priority: cancel current + clear queue, speak now
      this.stop();
      this.queue = [{ text, priority, onComplete }];
    } else if (priority === 'low') {
      // Low priority: only queue if nothing else playing
      if (this.queue.length === 0 && !this.isSpeaking) {
        this.queue.push({ text, priority, onComplete });
      } else {
        onComplete?.();
      }
    } else {
      // Normal: queue at end
      this.queue.push({ text, priority, onComplete });
    }
    
    this._processQueue();
  }
  
  /** Process the next item in queue */
  private _processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;
    
    const item = this.queue.shift()!;
    this.isSpeaking = true;
    
    const utterance = new SpeechSynthesisUtterance(item.text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = this.config.rate;
    utterance.pitch = this.config.pitch;
    utterance.volume = this.config.volume;
    utterance.lang = this.config.language;
    
    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      item.onComplete?.();
      this._processQueue();
    };
    
    utterance.onerror = (e) => {
      console.warn('[NARRATION] Error:', e.error);
      this.isSpeaking = false;
      this.currentUtterance = null;
      item.onComplete?.();
      this._processQueue();
    };
    
    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }
  
  /** Stop all narration immediately */
  public stop() {
    this.queue = [];
    this.synth.cancel();
    this.isSpeaking = false;
    this.currentUtterance = null;
  }
  
  /** Pause / resume */
  public pause() {
    this.synth.pause();
  }
  
  public resume() {
    this.synth.resume();
  }
  
  /** Enable / disable narration */
  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) this.stop();
  }
  
  public isEnabled(): boolean {
    return this.enabled;
  }
  
  /** Set volume/rate dynamically */
  public setVolume(v: number) { this.config.volume = Math.max(0, Math.min(1, v)); }
  public setRate(r: number) { this.config.rate = Math.max(0.5, Math.min(2.0, r)); }
  
  // ────────────────────────────────────────────────────────────────────
  // ── PROCESS-SPECIFIC NARRATION ──
  // ────────────────────────────────────────────────────────────────────
  
  /** Announce a process step transition */
  public announceStepTransition(
    previousStepName: string | null,
    currentStepName: string,
    stepIndex: number,
    totalSteps: number
  ) {
    // Avoid repeating the same announcement
    if (this.lastStepIndex === stepIndex) return;
    this.lastStepIndex = stepIndex;
    
    let text = '';
    
    if (previousStepName) {
      text = `${previousStepName} is completed. ${currentStepName} step starting now.`;
    } else {
      text = `Starting ${currentStepName}. Step ${stepIndex + 1} of ${totalSteps}.`;
    }
    
    this.speak(text, 'normal');
  }
  
  /** Announce process start */
  public announceProcessStart() {
    this.speak(
      'Process initiated. Loading wafer from FOUP cassette.',
      'high'
    );
  }
  
  /** Announce process complete */
  public announceProcessComplete() {
    this.speak(
      'All process steps completed. Wafer returning to FOUP for unload.',
      'high'
    );
  }
  
  /** Announce process pause/resume */
  public announcePause() {
    this.speak('Process paused.', 'high');
  }
  
  public announceResume() {
    this.speak('Process resumed.', 'high');
  }
  
  /** Announce reset */
  public announceReset() {
    this.speak('Simulation reset. Ready to start.', 'high');
  }
  
  /** Custom announcement with template */
  public announceCustom(template: string, vars: Record<string, string | number>) {
    let text = template;
    Object.entries(vars).forEach(([key, value]) => {
      text = text.replace(`{${key}}`, String(value));
    });
    this.speak(text, 'normal');
  }
}
