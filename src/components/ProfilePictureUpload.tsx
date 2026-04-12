import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../context/SettingsContext';
import { Tooltip } from './Tooltip';
import { cn } from '../lib/utils';

export const ProfilePictureUpload: React.FC = () => {
  const { profilePicture, setProfilePicture } = useSettings();
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: any
  ): Promise<string | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleSave = async () => {
    try {
      if (image && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(image, croppedAreaPixels);
        setProfilePicture(croppedImage);
        setIsCropping(false);
        setImage(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative group">
        <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border-2 border-outline-variant/20 group-hover:border-primary/50 transition-all">
          {profilePicture ? (
            <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">person</span>
          )}
        </div>
        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
          <span className="material-symbols-outlined text-white text-xl">edit</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
        </label>
      </div>
      
      <div>
        <p className="font-medium">Profile Identity</p>
        <p className="text-xs text-on-surface-variant">Upload a custom avatar for your profile.</p>
        {profilePicture && (
          <button 
            onClick={() => setProfilePicture(null)}
            className="text-[10px] text-red-400 font-bold uppercase tracking-wider mt-1 hover:text-red-300 transition-colors"
          >
            Remove Photo
          </button>
        )}
      </div>

      <AnimatePresence>
        {isCropping && image && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-6"
          >
            <div className="relative w-full max-w-lg aspect-square bg-surface-container-low rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round"
                showGrid={false}
              />
            </div>
            
            <div className="mt-8 w-full max-w-lg space-y-6">
              <div className="flex items-center gap-4">
                <span className="material-symbols-outlined text-on-surface-variant">zoom_in</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-primary"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setIsCropping(false);
                    setImage(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-surface-container-highest font-bold text-sm hover:bg-surface-container-highest/80 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Save Profile Photo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
