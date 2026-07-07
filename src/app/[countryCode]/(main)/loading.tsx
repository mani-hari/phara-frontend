export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          border: "2px solid var(--ink-line)",
          borderTopColor: "var(--sindoor)",
          display: "inline-block",
          animation: "phSpin 0.7s linear infinite",
        }}
      />
      <style>{`@keyframes phSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
