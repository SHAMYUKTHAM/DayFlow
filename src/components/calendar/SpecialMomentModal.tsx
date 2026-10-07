import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Calendar,
  Sparkles,
  MapPin,
  Tag as TagIcon,
  Trash2,
  Heart,
  Award,
  Plane,
  PartyPopper,
  GraduationCap,
  Star,
  Coffee,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import { SpecialMoment, SpecialDayType } from '../../types';
import { useData } from '../../contexts/DataContext';
import { getTodayDateString } from '../../utils/constants';

interface SpecialMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  momentToEdit?: SpecialMoment | null;
}

const TYPE_OPTIONS: {
  type: SpecialDayType;
  label: string;
  emoji: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    type: 'birthday',
    label: 'Birthday',
    emoji: '🎂',
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300',
    icon: <PartyPopper className="w-3.5 h-3.5" />,
  },
  {
    type: 'anniversary',
    label: 'Anniversary / Love',
    emoji: '💖',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300 border-pink-300',
    icon: <Heart className="w-3.5 h-3.5" />,
  },
  {
    type: 'milestone',
    label: 'Milestone',
    emoji: '🏆',
    color: 'bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300',
    icon: <Award className="w-3.5 h-3.5" />,
  },
  {
    type: 'achievement',
    label: 'Achievement',
    emoji: '🥇',
    color: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300',
    icon: <Star className="w-3.5 h-3.5" />,
  },
  {
    type: 'trip',
    label: 'Trip / Travel',
    emoji: '✈️',
    color: 'bg-sky-100 text-sky-900 dark:bg-sky-950/70 dark:text-sky-200 border-sky-300',
    icon: <Plane className="w-3.5 h-3.5" />,
  },
  {
    type: 'celebration',
    label: 'Celebration / Festival',
    emoji: '🎉',
    color: 'bg-purple-100 text-purple-900 dark:bg-purple-950/70 dark:text-purple-200 border-purple-300',
    icon: <Sparkles className="w-3.5 h-3.5" />,
  },
  {
    type: 'personal',
    label: 'Personal / Wellness',
    emoji: '🌿',
    color: 'bg-teal-100 text-teal-900 dark:bg-teal-950/70 dark:text-teal-200 border-teal-300',
    icon: <Coffee className="w-3.5 h-3.5" />,
  },
  {
    type: 'note',
    label: 'Special Note',
    emoji: '⭐',
    color: 'bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-200 border-stone-300',
    icon: <Star className="w-3.5 h-3.5" />,
  },
];

// Presets for quick photo attachment if user wants sample photo
const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Celebration',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1000&q=80',
    caption: 'Celebration with friends & fairy lights',
  },
  {
    label: 'Tech / Campus',
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80',
    caption: 'Campus tech project showcase',
  },
  {
    label: 'Mountain Trip',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80',
    caption: 'Scenic valley viewpoint and fresh air',
  },
  {
    label: 'Morning Coffee',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1000&q=80',
    caption: 'Golden morning coffee and sunrise',
  },
  {
    label: 'Academics / Graduation',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80',
    caption: 'Milestone review defense presentation',
  },
];

export const SpecialMomentModal: React.FC<SpecialMomentModalProps> = ({
  isOpen,
  onClose,
  defaultDate,
  momentToEdit,
}) => {
  const { addSpecialMoment, updateSpecialMoment, deleteSpecialMoment, showToast } = useData();

  const [date, setDate] = useState<string>(defaultDate || getTodayDateString());
  const [title, setTitle] = useState('');
  const [type, setType] = useState<SpecialDayType>('celebration');
  const [isSpecialDay, setIsSpecialDay] = useState(true);
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [location, setLocation] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (momentToEdit) {
      setDate(momentToEdit.date);
      setTitle(momentToEdit.title);
      setType(momentToEdit.type);
      setIsSpecialDay(momentToEdit.isSpecialDay !== false);
      setNote(momentToEdit.note || '');
      setPhotoUrl(momentToEdit.photoUrl || '');
      setPhotoCaption(momentToEdit.photoCaption || '');
      setLocation(momentToEdit.location || '');
      setTags(momentToEdit.tags || []);
    } else {
      setDate(defaultDate || getTodayDateString());
      setTitle('');
      setType('celebration');
      setIsSpecialDay(true);
      setNote('');
      setPhotoUrl('');
      setPhotoCaption('');
      setLocation('');
      setTags([]);
    }
  }, [momentToEdit, defaultDate, isOpen]);

  // Handle Photo File Upload with Canvas Compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      return;
    }

    setIsProcessingPhoto(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress to max width/height 1200px to keep localStorage snappy
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(compressedDataUrl);
          showToast('Photo attached successfully! 📸', 'success');
        } else {
          setPhotoUrl(event.target?.result as string);
        }
        setIsProcessingPhoto(false);
      };
      img.onerror = () => {
        setIsProcessingPhoto(false);
        showToast('Failed to load image', 'error');
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessingPhoto(false);
      showToast('Error reading image file', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a title for this special moment', 'warning');
      return;
    }

    const selectedTypeObj = TYPE_OPTIONS.find((t) => t.type === type);
    const emoji = selectedTypeObj?.emoji || '⭐';

    if (momentToEdit) {
      updateSpecialMoment(momentToEdit.id, {
        date,
        title: title.trim(),
        type,
        isSpecialDay,
        note: note.trim(),
        photoUrl: photoUrl || undefined,
        photoCaption: photoCaption.trim() || undefined,
        location: location.trim() || undefined,
        tags,
        emoji,
      });
    } else {
      addSpecialMoment({
        date,
        title: title.trim(),
        type,
        isSpecialDay,
        note: note.trim(),
        photoUrl: photoUrl || undefined,
        photoCaption: photoCaption.trim() || undefined,
        location: location.trim() || undefined,
        tags,
        emoji,
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (momentToEdit) {
      deleteSpecialMoment(momentToEdit.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 flex items-center justify-center text-lg">
              <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                {momentToEdit ? 'Edit Special Moment & Note' : 'Capture Special Moment & Day'}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Mark special dates, record memories, and attach photographs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Top Row: Date & Mark as Special Day */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  required
                />
              </div>
            </div>

            {/* Special Day Toggle Switch */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Special Day Highlight
              </label>
              <button
                type="button"
                onClick={() => setIsSpecialDay(!isSpecialDay)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all text-xs font-medium ${
                  isSpecialDay
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                    : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-400'
                }`}
              >
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Mark as Special Day
                </span>
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSpecialDay
                      ? 'bg-amber-600 text-white'
                      : 'border border-stone-300 dark:border-stone-600'
                  }`}
                >
                  {isSpecialDay && <Check className="w-3 h-3 stroke-[3]" />}
                </span>
              </button>
            </div>
          </div>

          {/* Type / Occasion Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-2">
              Occasion / Moment Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPE_OPTIONS.map((opt) => {
                const isSelected = type === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => setType(opt.type)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? `${opt.color} ring-2 ring-amber-500/20 font-semibold shadow-2xs`
                        : 'bg-stone-50/70 dark:bg-stone-800/50 border-stone-200/80 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300'
                    }`}
                  >
                    <span className="text-base">{opt.emoji}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Title of Moment or Occasion <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Won 1st Place in Hackathon, Beach Sunset with Best Friends, Mom's Birthday"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              required
            />
          </div>

          {/* Special Notes & Memories */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
              Special Notes & Memory Reflection
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write what made this day or moment memorable, who you were with, how it made you feel, or reflections to remember forever..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Photo Attachment Section */}
          <div className="space-y-3 p-4 rounded-2xl bg-amber-50/30 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                  Moment Photograph
                </span>
              </div>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove Photo</span>
                </button>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            {/* Photo preview or upload prompt */}
            {photoUrl ? (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-stone-700 max-h-64 bg-stone-950 flex items-center justify-center">
                  <img
                    src={photoUrl}
                    alt="Moment Preview"
                    className="w-full h-auto max-h-64 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white text-xs font-medium backdrop-blur-xs transition-colors flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Change Photo</span>
                  </button>
                </div>

                {/* Photo Caption input */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-500 mb-1">
                    Photo Caption (Optional)
                  </label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                    placeholder="e.g. Sunset golden hour with the entire team holding our trophy"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-amber-500 dark:hover:border-amber-500 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors bg-white/70 dark:bg-stone-900/60"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      Click to upload photo from your device
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Supports JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                </div>

                {/* Sample Presets */}
                <div className="pt-1">
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block mb-1.5">
                    Or choose a sample memory photo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PHOTO_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          setPhotoUrl(preset.url);
                          setPhotoCaption(preset.caption);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-colors flex items-center gap-1"
                      >
                        <ImageIcon className="w-3 h-3 text-amber-600" />
                        <span>{preset.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location & Tags Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Location (Optional)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Marina Beach, Campus Hall, Bistro"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 dark:text-stone-300 mb-1.5">
                Tags / Labels
              </label>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <TagIcon className="absolute left-3 top-3 w-3.5 h-3.5 text-stone-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add tag and hit Enter"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold"
                >
                  Add
                </button>
              </div>

              {/* Tag pills */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-[11px] text-stone-700 dark:text-stone-300 font-mono"
                    >
                      #{t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(t)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-stone-800">
            {momentToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Moment</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingPhoto}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{momentToEdit ? 'Save Changes' : 'Save Special Moment'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
