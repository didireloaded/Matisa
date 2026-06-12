import { useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  return (
    <div 
      className="h-screen w-full relative flex flex-col justify-between overflow-hidden" 
      style={{ background: "radial-gradient(circle at center 40%, rgba(200, 82, 26, 0.25) 0%, #0F0D0B 60%)" }}
    >
      {/* Top spacing */}
      <div className="flex-1" />

      {/* Center content */}
      <div className="flex flex-col items-center justify-center space-y-6 px-6 flex-1 z-10">
        {/* Abstract Logo Shape */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-[#E8A055] to-[#C8521A] shadow-2xl shadow-[#C8521A]/20">
          <div className="absolute inset-1 rounded-[22px] bg-[#0F0D0B] flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#E8A055] to-[#C8521A]" />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <h1 className="font-display text-5xl font-bold tracking-tight text-[#F5F0EA]">
            MATISA
          </h1>
          <p className="text-[#8A7F74] text-lg font-medium text-center">
            The heartbeat of Namibia.
          </p>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex flex-col space-y-4 px-6 pb-safe mb-12 flex-1 justify-end z-10">
        <button
          onClick={() => navigate("/")}
          className="w-full bg-[#F5F0EA] text-[#0F0D0B] font-semibold py-4 rounded-full text-[15px] transition-transform active:scale-[0.98]"
        >
          Continue with Google
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full border border-[#2E2822] text-[#F5F0EA] font-semibold py-4 rounded-full text-[15px] transition-transform active:scale-[0.98] hover:bg-[#1C1814]"
        >
          Continue with Phone
        </button>
      </div>
    </div>
  );
}
