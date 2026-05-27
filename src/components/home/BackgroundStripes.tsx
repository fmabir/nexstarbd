"use client";

export function BackgroundStripes() {
  return (
    <>
      <style>{`
        @keyframes stripe-slow-1 {
          0%, 100% { transform: rotate(-30deg) translateY(0px); }
          50%       { transform: rotate(-30deg) translateY(-28px); }
        }
        @keyframes stripe-slow-2 {
          0%, 100% { transform: rotate(-30deg) translateY(0px); }
          50%       { transform: rotate(-30deg) translateY(28px); }
        }
      `}</style>

      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 0 }}
        aria-hidden="true"
      >
        {/* Red stripe — top-left to bottom-right */}
        <div style={{
          position: "absolute",
          width: "350%",
          height: "160px",
          background: "rgba(244, 42, 65, 0.13)",
          borderRadius: "120px",
          top: "20%",
          left: "-125%",
          animation: "stripe-slow-1 12s ease-in-out infinite",
          transform: "rotate(-30deg)",
        }} />

        {/* Green stripe — parallel, offset lower */}
        <div style={{
          position: "absolute",
          width: "350%",
          height: "160px",
          background: "rgba(0, 106, 78, 0.13)",
          borderRadius: "120px",
          top: "55%",
          left: "-125%",
          animation: "stripe-slow-2 15s ease-in-out infinite",
          transform: "rotate(-30deg)",
        }} />
      </div>
    </>
  );
}
