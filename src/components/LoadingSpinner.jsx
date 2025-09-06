const LoadingSpinner = ({ size = "large", text = "Loading..." }) => {
  const spinnerSize = size === "small" ? 24 : size === "medium" ? 40 : 60;
  const textSize = size === "small" ? 14 : size === "medium" ? 16 : 18;
  
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" 
         style={{ minHeight: size === "small" ? "100px" : "300px", padding: "2rem" }}>
      <div
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `3px solid #f3f4f6`,
          borderTop: `3px solid #02457A`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem"
        }}
      />
           
      <p style={{ 
        color: "#64748b", 
        fontSize: textSize,
        fontWeight: 500,
        margin: 0,
        textAlign: "center"
      }}>
        {text}
      </p>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;