import React, { useState, useRef } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { lofiRhythmEngine } from '../audio/LofiRhythmEngine';
import { Download, FileText, Sparkles, Trash2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ZenTypewriterMode: React.FC = () => {
  const { themeConfig } = useTheme();
  const [content, setContent] = useState<string>(() => {
    return localStorage.getItem('mechtype_zen_draft') || '';
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordsCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charsCount = content.length;
  const readingTimeMin = Math.ceil(wordsCount / 200);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Audio trigger
    const isSpace = e.key === ' ';
    const isEnter = e.key === 'Enter';
    const isBackspace = e.key === 'Backspace';

    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: true,
      isSpacebar: isSpace,
      isEnter: isEnter,
      isBackspace: isBackspace,
    });

    if (lofiRhythmEngine.isEnabled() && e.key.length === 1) {
      lofiRhythmEngine.triggerHarmonizedKeystroke(e.key);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    soundEngine.triggerKeystroke({
      key: e.key,
      code: e.code,
      isKeyDown: false,
      isSpacebar: e.key === ' ',
      isEnter: e.key === 'Enter',
      isBackspace: e.key === 'Backspace',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem('mechtype_zen_draft', val);
  };

  const exportText = (format: 'txt' | 'md') => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mechtype-journal-${new Date().toISOString().slice(0, 10)}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearContent = () => {
    if (confirm('Clear your typewriter parchment?')) {
      setContent('');
      localStorage.removeItem('mechtype_zen_draft');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      {/* Zen Header HUD */}
      <div className="flex flex-wrap items-center justify-between w-full mb-6 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/5 backdrop-blur-md gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            ZEN TYPEWRITER // ASMR FREE-WRITING
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span>{wordsCount} words</span>
          <span>•</span>
          <span>{charsCount} characters</span>
          <span>•</span>
          <span>~{readingTimeMin} min read</span>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => exportText('md')}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 transition-colors"
              title="Export as Markdown (.md)"
            >
              <Download className="w-3.5 h-3.5" /> MD
            </button>
            <button
              onClick={() => exportText('txt')}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 flex items-center gap-1 transition-colors"
              title="Export as Plain Text (.txt)"
            >
              <FileText className="w-3.5 h-3.5" /> TXT
            </button>
            <button
              onClick={clearContent}
              className="p-1 rounded bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Clear Document"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Parchment Paper Container */}
      <div
        className="w-full min-h-[500px] p-8 sm:p-12 rounded-2xl border shadow-2xl relative transition-all duration-300"
        style={{
          backgroundColor: themeConfig.id === 'retro1984' ? '#ded4c1' : '#0d1117',
          borderColor: themeConfig.id === 'retro1984' ? '#c2b69f' : 'rgba(255,255,255,0.08)',
          color: themeConfig.id === 'retro1984' ? '#2e2720' : '#e2e8f0',
        }}
      >
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          placeholder="Begin typing freely... Let the mechanical clicks wash away all distractions. On Enter, enjoy the vintage carriage return clatter."
          className="w-full h-full min-h-[420px] bg-transparent resize-none border-none outline-none font-mono text-lg leading-relaxed placeholder:opacity-30"
          autoFocus
        />
      </div>
    </div>
  );
};
