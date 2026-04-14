import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  UserIcon,
  Upload,
  X,
  Check,
  RotateCcw,
} from "lucide-react";

interface ProfilePictureChangeProps {
  initialPicture?: string;
  onLoad?: (pfp: string) => void;
  onClose?: () => void;
}

export default function ProfilePictureChange({
  initialPicture,
  onLoad,
  onClose,
}: ProfilePictureChangeProps) {
  const [profilePicture, setProfilePicture] = useState<string | null>(
    initialPicture || null,
  );
  const [tempPicture, setTempPicture] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const LoadingToast = toast.loading("Loading image...");

    if (!file.type.startsWith("image/")) {
      toast.dismiss(LoadingToast);
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setTempPicture(reader.result as string);
      toast.dismiss(LoadingToast);
      toast.success("Image loaded");
    };
    reader.onerror = () => {
      toast.dismiss(LoadingToast);
      toast.error("Failed to read the file. \nPlease try again.");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (tempPicture) {
      const LoadingToast = toast.loading("Updating profile picture...");
      setTimeout(() => {
        if (onLoad) {
          onLoad(tempPicture);
        }
        setProfilePicture(tempPicture);
        setTempPicture(null);
        toast.dismiss(LoadingToast);
        toast.success("Profile picture updated!");
        if (onClose) {
          onClose();
        }
      }, 400);
    }
  };

  const handleReset = () => {
    setTempPicture(null);
    toast.success("Changes discarded");
  };

  const handleReturn = () => {
    if (tempPicture) {
      toast.error("Please save or reset changes first");
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const currentImage = tempPicture || profilePicture;
  const hasChanges = tempPicture !== null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between gap-6 relative px-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 text-foreground/80">
          <h3 className="text-lg font-bold text-foreground/80">Account Profile picture</h3>
        </div>
        <p className="text-xs text-foreground/50 text-center">
          Accepts any PNG derived format
          <br />
          Max file size: 5MB
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full flex items-center justify-center flex-1"
      >
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);

            const file = e.dataTransfer.files?.[0];
            if (file) {
              processFile(file);
            }
          }}
          className={`relative w-48 h-48 rounded-3xl transition-all duration-300 cursor-pointer group ${
            isDragging
              ? "bg-primary/20 border-primary scale-105"
              : "bg-secondary/30 border-border/50 hover:border-primary/50 hover:"
          } border-2 border-dashed flex items-center justify-center overflow-hidden`}
        >
          <AnimatePresence mode="wait">
            {currentImage ? (
              <motion.div
                key="image"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative pointer-events-none"
              >
                <img
                  src={currentImage}
                  alt="Profile Preview"
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
                  <Upload
                    size={32}
                    className="text-white pointer-events-none"
                  />
                </div>
                {hasChanges && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 bg-primary rounded-full p-1.5 shadow-lg pointer-events-none"
                  >
                    <Check
                      size={18}
                      className="text-white pointer-events-none"
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center gap-3 text-muted-foreground group-hover:text-primary transition-colors pointer-events-none"
              >
                <motion.div
                  animate={{
                    y: isDragging ? -5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="pointer-events-none"
                >
                  <UserIcon
                    size={48}
                    strokeWidth={1.5}
                    className="pointer-events-none"
                  />
                </motion.div>
                <motion.div
                  animate={{
                    y: isDragging ? 5 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col items-center gap-1 pointer-events-none"
                >
                  <Upload size={20} className="pointer-events-none" />
                  <span className="text-xs font-medium pointer-events-none">
                    {isDragging ? "Drop here" : "Upload"}
                  </span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full flex items-center justify-center gap-3"
      >
        <button
          type="button"
          onClick={handleReturn}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 transition-all duration-300 ease-out-cubic text-foreground/70 hover:text-destructive hover:brightness-150 hover:border-destructive text-sm font-medium shadow-sm hover:scale-105 active:scale-95 cursor-pointer"
        >
          <X size={18} className="pointer-events-none" />
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={!hasChanges}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-border/50 border transition-all duration-300 ease-out-cubic text-sm font-medium shadow-sm ${
            hasChanges
              ? "hover:border-warning/80 text-foreground/70 hover:text-warning hover:brightness-90 cursor-pointer hover:scale-105 active:scale-95"
              : "text-foreground/70 border-border/30 brightness-50 cursor-not-allowed"
          }`}
        >
          <RotateCcw size={18} className="pointer-events-none" />
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!hasChanges}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border/50 transition-all duration-300 ease-out-cubic text-sm font-medium shadow-sm ${
            hasChanges
              ? "text-foreground/70 cursor-pointer hover:border-success hover:text-success hover:scale-105 active:scale-95"
              : "border-border/30 text-foreground/70 brightness-50 cursor-not-allowed"
          }`}
        >
          <Check size={18} className="pointer-events-none" />
        </button>
      </motion.div>
    </div>
  );
}
