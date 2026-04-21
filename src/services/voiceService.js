// Web Speech API — no libraries needed

const SpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

let recognition = null;
let isListening = false;

export const voiceSupported = {
  recognition: !!SpeechRecognition,
  synthesis: typeof window !== 'undefined' && 'speechSynthesis' in window
};

export function startListening({ onResult, onError, onEnd }) {
  if (!SpeechRecognition) {
    onError?.(new Error('SpeechRecognition not supported in this browser'));
    return () => {};
  }

  if (recognition) stopListening();

  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    onResult?.(transcript);
  };

  recognition.onerror = (e) => {
    onError?.(e);
  };

  recognition.onend = () => {
    isListening = false;
    onEnd?.();
  };

  try {
    recognition.start();
    isListening = true;
  } catch (e) {
    onError?.(e);
  }

  return () => stopListening();
}

export function stopListening() {
  if (recognition && isListening) {
    try { recognition.stop(); } catch {}
  }
  isListening = false;
}

export function speak(text, { rate = 1, pitch = 1, voice = null, onEnd } = {}) {
  if (!voiceSupported.synthesis) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = pitch;
  if (voice) utter.voice = voice;
  if (onEnd) utter.onend = onEnd;
  window.speechSynthesis.speak(utter);
  return utter;
}

export function cancelSpeech() {
  if (voiceSupported.synthesis) window.speechSynthesis.cancel();
}

export async function narrateItinerary(data, { onPanel } = {}) {
  cancelSpeech();
  const intro = `${data.tagline}. A ${data.mood} day in ${data.city}.`;
  await speakAsync(intro);

  for (let i = 0; i < data.panels.length; i++) {
    onPanel?.(i);
    const p = data.panels[i];
    const text = `${p.time}. ${p.title}. ${p.caption} ${p.dialogue || ''}`;
    await speakAsync(text);
  }
  onPanel?.(-1);
}

function speakAsync(text) {
  return new Promise((resolve) => {
    speak(text, { onEnd: resolve });
  });
}
