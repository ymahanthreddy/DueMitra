// ElevenLabs AI Voice Agent & Callback Utility for Kavach OS
// Integrates ElevenLabs Text-to-Speech & Conversational Calling for overdue debt collection

export const DEFAULT_ELEVENLABS_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Professional B2B Credit Officer)', accent: 'Indian / Global English', gender: 'Female' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam (Assertive Commercial Debt Recovery)', accent: 'Authoritative / Firm', gender: 'Male' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel (Calm & Cordial Merchant Reminder)', accent: 'Warm & Professional', gender: 'Female' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam (Corporate Accounts Officer)', accent: 'Clear & Direct', gender: 'Male' },
];

export const TARGET_CALLBACK_PHONE = '+91 94834 10461';

/**
 * Generates an articulate, compliant B2B payment notification script
 */
export function generateCallScript({
  customerName = 'Valued Customer',
  contactPerson = '',
  businessName = 'Kavach Mobile Accessories',
  invoiceNumber = 'KVC/26-27/0038',
  amountFormatted = '₹53,100',
  daysOverdue = 15,
  language = 'en',
}) {
  const salutation = contactPerson ? `${contactPerson} ji` : `${customerName} accounts team`;

  if (language === 'hi') {
    return `नमस्ते ${salutation}, यह ${businessName} की ओर से एक महत्वपूर्ण भुगतान कॉल है। आपके इनवॉइस नंबर ${invoiceNumber} का कुल बकाया ${amountFormatted} है, जो पिछले ${daysOverdue} दिनों से ड्यू है। कृपया व्यापारिक क्रेडिट रेटिंग बनाए रखने के लिए आज ही UPI अथवा बैंक ट्रांसफर द्वारा इसका भुगतान सुनिश्चित करें। धन्यवाद।`;
  }

  return `Hello ${salutation}. This is an automated priority payment call from ${businessName}. We are calling regarding tax invoice ${invoiceNumber} for the balance amount of ${amountFormatted}, which is currently ${daysOverdue} days past due. Kindly clear this payment today via the secure UPI link dispatched to your registered phone number ${TARGET_CALLBACK_PHONE}. If already paid, please share your UTR in the WhatsApp portal. Thank you.`;
}

/**
 * Synthesizes speech using ElevenLabs API, or falls back to Web Speech Synthesis API
 */
export async function speakVoiceReminder({
  script,
  voiceId = '9BWtsMINqrJLrRacOk9x',
  apiKey = '',
  onStart = () => {},
  onEnd = () => {},
  onError = () => {},
}) {
  const cleanKey =
    (apiKey || '').trim() ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('elevenlabs_api_key') || '' : '');

  // 1. If valid ElevenLabs API key provided, call ElevenLabs TTS API
  if (cleanKey && cleanKey.startsWith('sk_') || cleanKey.length > 20) {
    try {
      onStart();
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': cleanKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: script,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('ElevenLabs API returned notice:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        onEnd();
      };
      audio.onerror = (e) => {
        URL.revokeObjectURL(audioUrl);
        onError(e);
      };

      await audio.play();
      return { success: true, mode: 'elevenlabs_api', audioUrl };
    } catch (err) {
      console.warn('ElevenLabs API call fallback to browser synthesis:', err.message);
      // Fall through to browser synthesis
    }
  }

  // 2. High-fidelity Web Speech Synthesis Fallback (Zero setup required for demo!)
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;

    // Pick a natural English/Indian voice if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(v =>
      v.lang.includes('en-IN') ||
      v.name.includes('India') ||
      v.name.includes('Natural') ||
      v.name.includes('Google') ||
      v.lang.includes('en-GB') ||
      v.lang.includes('en-US')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => onStart();
    utterance.onend = () => onEnd();
    utterance.onerror = (e) => onError(e);

    window.speechSynthesis.speak(utterance);
    return { success: true, mode: 'browser_synthesis' };
  }

  onError(new Error('Audio synthesis not supported in this browser.'));
  return { success: false, error: 'Not supported' };
}

/**
 * Synthesizes authentic telephone dial and ring tones using Web Audio API
 */
export function playPhoneRingTone(durationMs = 2800) {
  if (typeof window === 'undefined') return Promise.resolve();

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return Promise.resolve();

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Ring 1: 0.2s - 1.2s
    playDualTone(ctx, 440, 480, now + 0.2, 0.9);
    // Ring 2: 1.6s - 2.6s
    playDualTone(ctx, 440, 480, now + 1.5, 0.9);

    return new Promise((resolve) => {
      setTimeout(() => {
        try { ctx.close(); } catch(e) {}
        resolve();
      }, durationMs);
    });
  } catch (e) {
    return Promise.resolve();
  }
}

function playDualTone(ctx, freq1, freq2, startTime, duration) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();

  osc1.frequency.value = freq1;
  osc2.frequency.value = freq2;

  gain.gain.setValueAtTime(0.001, startTime);
  gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
  gain.gain.setValueAtTime(0.12, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0.001, startTime + duration);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(ctx.destination);

  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
}

