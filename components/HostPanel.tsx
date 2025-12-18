import React, { useState, useEffect } from 'react';
import { createRound, uploadImage, getUploadedImages, updateUserStatus } from '../firebaseService';
import { UploadedImage } from '../gameTypes';

interface HostPanelProps {
  hostUserId: string;
  player1Id: string;
  player2Id: string;
  player1Name: string;
  player2Name: string;
  onRoundStarted: (roundId: string) => void;
  onCancel: () => void;
}

export const HostPanel: React.FC<HostPanelProps> = ({
  hostUserId,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
  onRoundStarted,
  onCancel
}) => {
  const [answer, setAnswer] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showImageGallery, setShowImageGallery] = useState(false);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    const images = await getUploadedImages();
    setUploadedImages(images);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadImage(file, hostUserId);
      setSelectedImage(url);
      await loadImages();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    }
    setIsUploading(false);
  };

  const handleStartRound = async () => {
    if (!selectedImage || !answer.trim()) {
      alert('Please select an image and set the answer');
      return;
    }

    setIsCreating(true);
    try {
      // Set players to "in_match" status
      await updateUserStatus(player1Id, 'in_match');
      await updateUserStatus(player2Id, 'in_match');

      // Create the round
      const roundId = await createRound({
        status: 'active',
        imageUrl: selectedImage,
        answer: answer.trim(),
        playerIds: [player1Id, player2Id],
        winnerId: null,
        startedAt: Date.now(),
        endedAt: null,
        createdBy: hostUserId
      });

      onRoundStarted(roundId);
    } catch (error) {
      console.error('Error starting round:', error);
      alert('Failed to start round. Please try again.');
      // Revert player status on error
      await updateUserStatus(player1Id, 'available');
      await updateUserStatus(player2Id, 'available');
    }
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa-solid fa-crown text-4xl text-amber-600"></i>
          </div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">Host Panel</h1>
          <p className="text-lg text-slate-600 font-medium">Set up the next round</p>
        </div>

        {/* Players Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-users text-indigo-600"></i>
            Selected Players
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-2xl text-center">
              <i className="fa-solid fa-user text-2xl text-blue-600 mb-2"></i>
              <p className="font-black text-blue-800 text-lg">{player1Name}</p>
            </div>
            <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl text-center">
              <i className="fa-solid fa-user text-2xl text-rose-600 mb-2"></i>
              <p className="font-black text-rose-800 text-lg">{player2Name}</p>
            </div>
          </div>
        </div>

        {/* Image Selection */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-image text-purple-600"></i>
            Select Image
          </h2>

          <div className="space-y-4">
            {/* Upload New Image */}
            <label className="cursor-pointer flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-300 rounded-2xl hover:bg-slate-50 hover:border-indigo-400 transition-all group">
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-slate-400 group-hover:text-indigo-600"></i>
              <div>
                <p className="text-lg font-bold text-slate-700 group-hover:text-indigo-600">
                  {isUploading ? 'Uploading...' : 'Upload New Image'}
                </p>
                <p className="text-sm text-slate-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </label>

            {/* Or Choose Existing */}
            {uploadedImages.length > 0 && (
              <button
                onClick={() => setShowImageGallery(!showImageGallery)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
              >
                <i className="fa-solid fa-folder-open mr-2"></i>
                {showImageGallery ? 'Hide' : 'Choose from'} Gallery ({uploadedImages.length})
              </button>
            )}

            {/* Gallery */}
            {showImageGallery && (
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2">
                {uploadedImages.map((img) => (
                  <div
                    key={img.id}
                    onClick={() => {
                      setSelectedImage(img.url);
                      setShowImageGallery(false);
                    }}
                    className={`cursor-pointer rounded-xl overflow-hidden border-4 transition-all hover:scale-105 ${
                      selectedImage === img.url ? 'border-indigo-500 shadow-lg' : 'border-slate-200'
                    }`}
                  >
                    <img src={img.url} alt={img.name} className="w-full h-24 object-cover" />
                  </div>
                ))}
              </div>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="relative rounded-2xl overflow-hidden border-4 border-indigo-500 shadow-lg">
                <img src={selectedImage} alt="Selected" className="w-full h-64 object-cover" />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Answer Input */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-key text-green-600"></i>
            Set Correct Answer
          </h2>
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="e.g., Eiffel Tower, Cat, Pizza..."
            className="w-full px-6 py-4 text-lg font-bold border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          />
          <p className="text-sm text-slate-500 mt-2">
            <i className="fa-solid fa-info-circle mr-1"></i>
            Case-insensitive matching will be applied
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 py-5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xl font-black rounded-2xl transition-all"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Cancel
          </button>
          <button
            onClick={handleStartRound}
            disabled={!selectedImage || !answer.trim() || isCreating}
            className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl font-black rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {isCreating ? (
              <><i className="fa-solid fa-spinner fa-spin mr-2"></i> Starting...</>
            ) : (
              <><i className="fa-solid fa-rocket mr-2"></i> Start Round</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
