import React, { useState, useMemo } from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { calculateWer } from '../../lib/audioProcessing';

export const SpeechProcessingLab: React.FC = () => {
  const [referenceText, setReferenceText] = useState<string>(
    'multimedia dan computer vision menghasilkan kecerdasan buatan visual dan audio'
  );
  const [hypothesisText, setHypothesisText] = useState<string>(
    'multimedia dan komputer vision menghasilkan kecerdasan visual dan audio'
  );
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(1.0);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [asrSupport, setAsrSupport] = useState<boolean>(true);

  // Compute WER & CER metrics
  const evaluation = useMemo(() => {
    return calculateWer(referenceText, hypothesisText);
  }, [referenceText, hypothesisText]);

  // Web Speech API: Text-to-Speech (TTS)
  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Browser tidak mendukung SpeechSynthesis Web API.');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API: Speech Recognition (ASR)
  const handleStartRecognition = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: any; webkitSpeechRecognition: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setAsrSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setHypothesisText(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setAsrSupport(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl space-y-5">
      {/* Header */}
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-lg font-semibold text-slate-100">
          Chapter 23: Speech Recognition (ASR) & Speech Synthesis (TTS) Lab
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Eksperimen sintesis suara Text-to-Speech (TTS), transkripsi Automatic Speech Recognition (ASR), dan evaluasi akurasi fonetik menggunakan metrik Word Error Rate (WER) & Levenshtein Distance.
        </p>
      </div>

      {/* TTS Section */}
      <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-primary-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" /> 1. Text-to-Speech (TTS) Synthesis
          </span>
          <button
            onClick={() => handleSpeak(referenceText)}
            className="px-3 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded text-xs font-medium transition"
          >
            Sintesis Suara (TTS)
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Kecepatan Bicara (Rate):</span>
              <span className="font-mono text-slate-200">{ttsRate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={ttsRate}
              onChange={(e) => setTtsRate(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Tinggi Nada (Pitch):</span>
              <span className="font-mono text-slate-200">{ttsPitch.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.5}
              step={0.1}
              value={ttsPitch}
              onChange={(e) => setTtsPitch(Number(e.target.value))}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      </div>

      {/* ASR & WER Comparison Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-slate-300">Teks Referensi (Ground Truth):</span>
            <textarea
              rows={3}
              value={referenceText}
              onChange={(e) => setReferenceText(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">Hipotesis Transkripsi (ASR Output):</span>
              <button
                onClick={handleStartRecognition}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <Mic className="w-3 h-3" />
                {isListening ? 'Mendengarkan...' : 'Gunakan Mikrofon ASR'}
              </button>
            </div>
            <textarea
              rows={3}
              value={hypothesisText}
              onChange={(e) => setHypothesisText(e.target.value)}
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        {!asrSupport && (
          <p className="text-[11px] text-amber-400">
            * Browser saat ini belum mendukung Web Speech Recognition API secara native. Anda dapat mengedit teks hipotesis secara manual untuk menguji metrik evaluasi WER.
          </p>
        )}
      </div>

      {/* Quantitative Evaluation Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block">Word Error Rate (WER)</span>
          <span
            className={`text-base font-semibold font-mono ${
              evaluation.wer === 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {(evaluation.wer * 100).toFixed(1)}%
          </span>
        </div>
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block">Akurasi Kata (1 - WER)</span>
          <span className="text-base font-semibold font-mono text-sky-400">
            {Math.max(0, (1 - evaluation.wer) * 100).toFixed(1)}%
          </span>
        </div>
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block">Substitusi ($S$) / Del ($D$)</span>
          <span className="text-base font-semibold font-mono text-purple-400">
            {evaluation.substitutions} / {evaluation.deletions}
          </span>
        </div>
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
          <span className="text-slate-400 block">Insersi ($I$) / Total Kata ($N$)</span>
          <span className="text-base font-semibold font-mono text-rose-400">
            {evaluation.insertions} / {evaluation.wordCount}
          </span>
        </div>
      </div>
    </div>
  );
};
