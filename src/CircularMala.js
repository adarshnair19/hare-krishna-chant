import React, {useEffect} from "react";


function CircularMala({ totalBeads, currentBeadIndex, size = 300,  beadSpacing = 12 }) {
  const beadRadius = 8;
  const guruBeadRadius = 12;
  const center = size / 2;
  const threadColor = "#8B4513";

  const [rotation, setRotation] = React.useState(0);

  // Smooth rotation animation
  useEffect(() => {
  const directionRef = { current: 1 }; // persistent direction
  let rafId;

  const animate = () => {
    setRotation(prev => {
      let newRotation = prev + 0.1 * directionRef.current;
      if (newRotation > 5) directionRef.current = -1;
      if (newRotation < -5) directionRef.current = 1;
      return newRotation;
    });
    rafId = requestAnimationFrame(animate);
  };

  animate();

  return () => cancelAnimationFrame(rafId); // cleanup
}, []);

const malaRadius = center - guruBeadRadius - beadSpacing;
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "40px auto",
        transform: `rotate(${rotation}deg)`,
        transition: "transform 0.1s linear",
      }}
    >
      {Array.from({ length: totalBeads }).map((_, i) => {
        const angle = (i / totalBeads) * 2 * Math.PI - Math.PI / 2;
        const x = center + malaRadius * Math.cos(angle);
        const y = center + malaRadius * Math.sin(angle);

        const nextAngle = ((i + 1) % totalBeads) / totalBeads * 2 * Math.PI - Math.PI / 2;
        const nextX = center + malaRadius * Math.cos(nextAngle);
        const nextY = center + malaRadius * Math.sin(nextAngle);

        const isGuru = i === 0;
        const isCompleted = i < currentBeadIndex;
        const isCurrent = i === currentBeadIndex;

        // Dynamic bead colors
        let beadColor = "#deb887"; // default wood
        if (isCompleted) beadColor = "#f97316"; // completed
        if (isCurrent) beadColor = "#ffb347"; // glowing current
        if (isGuru) beadColor = "#7c3aed";

        // Glow pulsation for current bead
        const scale = isCurrent ? 1.2 + 0.05 * Math.sin(Date.now() / 200) : 1;
        const boxShadow = isCurrent
          ? `0 0 12px 4px #ffb347, inset 0 0 5px rgba(255,255,255,0.3)`
          : "0 2px 4px rgba(0,0,0,0.3)";

        return (
          <React.Fragment key={i}>
            {/* Thread */}
            <div
              style={{
                position: "absolute",
                width: Math.hypot(nextX - x, nextY - y),
                height: 3,
                background: threadColor,
                left: x,
                top: y,
                transformOrigin: "0 0",
                transform: `rotate(${Math.atan2(nextY - y, nextX - x)}rad)`,
                borderRadius: 2,
                zIndex: 0,
              }}
            />
            {/* Bead */}
            <div
              style={{
                position: "absolute",
                width: isGuru ? guruBeadRadius * 2 : beadRadius * 2,
                height: isGuru ? guruBeadRadius * 2 : beadRadius * 2,
                borderRadius: "50%",
                background: `radial-gradient(circle at 30% 30%, #fff, ${beadColor})`,
                border: "1px solid #9c7a58",
                left: x - (isGuru ? guruBeadRadius : beadRadius),
                top: y - (isGuru ? guruBeadRadius : beadRadius),
                boxShadow,
                transform: `scale(${scale})`,
                transition: "all 200ms ease",
                zIndex: 1,
              }}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}


export default CircularMala;