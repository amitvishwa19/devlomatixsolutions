import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoadingScreen from "@/carewell/components/LoadingScreen";
import HospitalSetupModal from "@/carewell/components/HospitalSetupModal";
import { Settings } from "lucide-react";

const Loader = () => {
  const navigate = useNavigate();
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    // Show setup modal after 3 seconds
    const timer = setTimeout(() => {
      setShowSetupModal(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSetupComplete = (setupData) => {
    console.log('Hospital setup completed:', setupData);
    // TODO: Save setup data to backend
    setShowSetupModal(false);
    navigate("/dashboard");
  };

  const openSetupModal = () => {
    setShowSetupModal(true);
  };

  return (
    <>
      <LoadingScreen />
      
      {/* Setup Button - Bottom Right */}
      <button
        onClick={openSetupModal}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all shadow-lg hover:scale-110"
        title="Hospital Setup"
      >
        <Settings className="w-6 h-6" />
      </button>

      <HospitalSetupModal
        isOpen={showSetupModal}
        onComplete={handleSetupComplete}
      />
    </>
  );
};

export default Loader;