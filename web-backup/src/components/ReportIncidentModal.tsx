import React, { useState, useEffect } from 'react';
import { X, MapPin, AlertCircle, Send, Loader2 } from 'lucide-react';
import { createIncident, type IncidentCategory } from '../supabase/incidents';
import { getIncidentCategories, getDescriptionCharCount } from '../lib/incidentSanitizer';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export function ReportIncidentModal({
  isOpen,
  onClose,
  onSuccess,
  userLocation,
}: ReportIncidentModalProps) {
  const [category, setCategory] = useState<IncidentCategory | ''>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = getIncidentCategories();
  const charCount = getDescriptionCharCount(description);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory('');
      setDescription('');
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError('Please select a category');
      return;
    }

    if (!description.trim()) {
      setError('Please provide a description');
      return;
    }

    if (!userLocation) {
      setError('Unable to determine your location. Please enable location services.');
      return;
    }

    setIsSubmitting(true);

    const result = await createIncident({
      lat: userLocation.lat,
      lng: userLocation.lng,
      category: category as IncidentCategory,
      description,
    });

    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    onSuccess();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="relative w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">Report an Incident</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Disclaimer */}
        <div className="p-3 mx-4 mt-4 bg-amber-900/30 border border-amber-700/50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-200">
              <strong>Community reports only.</strong> Do not include names, accusations, 
              or exact addresses. Reports are unverified and visible for 31 days.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Location indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <MapPin className="h-4 w-4" />
            {userLocation ? (
              <span>Reporting from your approximate location</span>
            ) : (
              <span className="text-amber-500">Location not available</span>
            )}
          </div>

          {/* Category select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IncidentCategory)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-[#1785d1] focus:border-transparent transition-all"
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe what you observed..."
              rows={3}
              maxLength={200}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-[#1785d1] focus:border-transparent transition-all resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                No names, accusations, or addresses
              </span>
              <span
                className={`text-xs ${
                  charCount.remaining < 20 ? 'text-amber-500' : 'text-gray-500'
                }`}
              >
                {charCount.remaining} characters remaining
              </span>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !category || !description.trim() || !userLocation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1785d1] hover:bg-[#1470b8] disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Report
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
















