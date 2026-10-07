import React, { useEffect } from 'react';
import { X, Calendar, MapPin, Tag } from 'lucide-react';
import { SpecialMoment } from '../../types';
import { formatDateLabel } from '../../utils/constants';

interface PhotoLightboxProps {
  moment: SpecialMoment | null;
  onClose: () => void;
}

export const PhotoLightbox: React.FC<PhotoLightboxProps> = ({ moment, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!moment || !moment.photoUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full max-h-[90vh] bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors border border-white/10"
          aria-label="Close photo preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Container */}
        <div className="relative flex-1 min-h-[300px] max-h-[62vh] bg-black flex items-center justify-center overflow-hidden">
          <img
            src={moment.photoUrl}
            alt={moment.title}
            className="w-full h-full object-contain select-none"
          />
        </div>

        {/* Caption & Metadata Footer */}
        <div className="p-5 sm:p-6 bg-stone-900 text-stone-100 border-t border-stone-800 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{moment.emoji || '📸'}</span>
              <h3 className="text-lg font-bold font-serif-heading text-white">{moment.title}</h3>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-stone-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                {formatDateLabel(moment.date)}
              </span>
              {moment.location && (
                <span className="flex items-center gap-1 text-stone-400">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  {moment.location}
                </span>
              )}
            </div>
          </div>

          {moment.photoCaption && (
            <p className="text-xs sm:text-sm text-stone-300 italic font-serif">
              "{moment.photoCaption}"
            </p>
          )}

          {moment.note && (
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed pt-1">
              {moment.note}
            </p>
          )}

          {moment.tags && moment.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2">
              {moment.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-stone-800 text-[11px] text-stone-300 font-mono"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
