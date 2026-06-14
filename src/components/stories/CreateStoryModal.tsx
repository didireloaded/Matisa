import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, Type, Music, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { StoryService, StoryType } from "@/services/stories";
import { toast } from "sonner";

interface CreateStoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateStoryModal({ open, onClose }: CreateStoryModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [storyType, setStoryType] = useState<StoryType>("image");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState("");
  const [bgGradient, setBgGradient] = useState("linear-gradient(135deg, #FF6B6B, #556270)");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      setStoryType(selected.type.startsWith("video/") ? "video" : "image");
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;
    if (storyType === "text" && !textContent.trim()) {
      toast.error("Please enter some text");
      return;
    }
    if (["image", "video"].includes(storyType) && !file) {
      toast.error("Please select a media file");
      return;
    }

    setLoading(true);
    try {
      await StoryService.createStory({
        userId: profile.id,
        mediaType: storyType,
        file: file || undefined,
        content: textContent,
        backgroundGradient: storyType === "text" ? bgGradient : undefined,
      });
      toast.success("Story posted successfully!");
      handleClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to post story");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewUrl(null);
    setTextContent("");
    setStoryType("image");
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-0 z-50 bg-[#0F0D0B] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 z-10 absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={handleClose} className="p-2 rounded-full bg-black/20 backdrop-blur-md">
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setStoryType("text");
                setFile(null);
                setPreviewUrl(null);
              }}
              className="p-2 rounded-full bg-black/20 backdrop-blur-md"
            >
              <Type
                className={`w-5 h-5 ${storyType === "text" ? "text-[#C8521A]" : "text-white"}`}
              />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full bg-black/20 backdrop-blur-md"
            >
              <ImageIcon
                className={`w-5 h-5 ${["image", "video"].includes(storyType) ? "text-[#C8521A]" : "text-white"}`}
              />
            </button>
            <button className="p-2 rounded-full bg-black/20 backdrop-blur-md">
              <Music className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*,video/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* Content Area */}
        <div
          className="flex-1 flex items-center justify-center relative overflow-hidden"
          style={{ background: storyType === "text" ? bgGradient : "#1C1814" }}
        >
          {["image", "video"].includes(storyType) && previewUrl ? (
            storyType === "video" ? (
              <video
                src={previewUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            )
          ) : storyType === "text" ? (
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Tap to type..."
              className="w-full px-8 text-center bg-transparent text-white text-3xl font-bold placeholder:text-white/50 outline-none resize-none"
              rows={4}
              autoFocus
            />
          ) : (
            <div
              className="flex flex-col items-center gap-4 text-white/50"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="w-16 h-16 opacity-50" />
              <span className="font-medium">Tap to select media</span>
            </div>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="p-4 absolute bottom-0 left-0 right-0 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent pb-8">
          <div className="flex-1">
            {storyType !== "text" && (
              <input
                type="text"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Add a caption..."
                className="w-full bg-black/30 backdrop-blur-md text-white rounded-full px-4 py-3 outline-none border border-white/10"
              />
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="ml-4 w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 text-black animate-spin" />
            ) : (
              <Send className="w-5 h-5 text-black -ml-1" />
            )}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
