import { useDiscoveryStore } from "@/stores/useDiscoveryStore";
import { AnimatePresence, motion } from "framer-motion";

export function ProfilePreviewCard() {
  const selectedUserId = useDiscoveryStore((state) => state.selectedUserId);
  const setSelectedUserId = useDiscoveryStore((state) => state.setSelectedUserId);

  return (
    <AnimatePresence>
      {selectedUserId && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="absolute bottom-24 left-4 right-4 z-20 bg-card rounded-2xl p-4 border border-border"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">User Profile</h3>
            <button
              onClick={() => setSelectedUserId(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
