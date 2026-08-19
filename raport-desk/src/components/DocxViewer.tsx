import React, { useEffect, useRef, useState } from 'react';
import { renderAsync } from 'docx-preview';
import { ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';

interface DocxViewerProps {
  fileBuffer: ArrayBuffer | null;
}

export const DocxViewer: React.FC<DocxViewerProps> = ({ fileBuffer }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(100);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileBuffer || !containerRef.current) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    // Очищаємо попередній вміст перед рендером нового документа
    containerRef.current.innerHTML = '';

    renderAsync(fileBuffer, containerRef.current, undefined, {
      className: 'docx-rendered-document',
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      ignoreFonts: false,
      breakPages: true,
      useBase64URL: true,
      experimental: false,
      trimXml: true
    })
      .then(() => {
        if (isMounted) setIsLoading(false);
      })
      .catch((err) => {
        console.error('Docx Preview Error:', err);
        if (isMounted) {
          setError('Не вдалося згенерувати попередній перегляд документа');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [fileBuffer]);

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(150, Math.max(50, prev + delta)));
  };

  const handleResetZoom = () => {
    setScale(100);
  };

  return (
    <div className="h-full flex flex-col rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-2xl">
      {/* Верхня панель інструментів перегляду та масштабу */}
      <div className="h-11 px-4 border-b border-slate-800/80 bg-slate-950/80 flex items-center justify-between shrink-0 select-none backdrop-blur-sm">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Попередній перегляд (A4)</span>
        </div>

        {/* Панель масштабування */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1">
            <button
              type="button"
              onClick={() => handleZoom(-10)}
              disabled={scale <= 50}
              className="text-slate-400 hover:text-slate-100 disabled:opacity-30 transition p-0.5"
              title="Зменшити (-10%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Слайдер масштабу */}
            <input
              type="range"
              min={50}
              max={150}
              step={5}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              title={`Масштаб: ${scale}%`}
            />

            <button
              type="button"
              onClick={() => handleZoom(10)}
              disabled={scale >= 150}
              className="text-slate-400 hover:text-slate-100 disabled:opacity-30 transition p-0.5"
              title="Збільшити (+10%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="text-[11px] font-mono text-slate-300 w-9 text-right select-none ml-1">
              {scale}%
            </span>
          </div>

          {/* Кнопка скидання масштабу на 100% */}
          {scale !== 100 && (
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Скинути до 100%"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Робоча область перегляду документа */}
      <div className="flex-1 overflow-auto bg-slate-950 p-6 flex justify-center items-start custom-scrollbar">
        {isLoading && (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 animate-pulse">
            Оновлення перегляду документа...
          </div>
        )}

        {error && (
          <div className="h-full flex items-center justify-center text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Контейнер під аркуш Word */}
        <div
          style={{
            transform: `scale(${scale / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          className="flex justify-center shadow-2xl rounded-sm my-2"
        >
          <div
            ref={containerRef}
            className="docx-container bg-white text-black min-h-[297mm] w-[210mm] shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};