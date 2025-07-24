// src/app/loading.tsx - Futuristic Loading Animation
import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center overflow-hidden">
      {/* Background animated grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="grid-animation"></div>
      </div>

      {/* Main loading container */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Logo with glow effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl opacity-30 animate-pulse scale-150"></div>
          <div className="relative bg-black rounded-full p-6 border-2 border-orange-500 shadow-2xl">
            <Image
              src="/lambang bulat.png"
              alt="Radja Auto Car"
              width={80}
              height={80}
              className="relative z-10 drop-shadow-lg"
              unoptimized
            />
          </div>
        </div>

        {/* Brand text */}
        <h2 className="text-white text-2xl font-bold mb-8 tracking-wide font-serif">
          RADJA AUTO CAR
        </h2>

        {/* Collision animation container */}
        <div className="relative w-80 h-32 mb-8">
          {/* Horizontal lines */}
          <div className="absolute top-1/2 left-0 w-full h-1 transform -translate-y-1/2">
            <div className="line-left"></div>
            <div className="line-right"></div>
          </div>

          {/* Vertical lines */}
          <div className="absolute left-1/2 top-0 w-1 h-full transform -translate-x-1/2">
            <div className="line-top"></div>
            <div className="line-bottom"></div>
          </div>

          {/* Diagonal lines */}
          <div className="absolute inset-0">
            <div className="line-diagonal-1"></div>
            <div className="line-diagonal-2"></div>
            <div className="line-diagonal-3"></div>
            <div className="line-diagonal-4"></div>
          </div>

          {/* Center collision point */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="collision-center"></div>
          </div>
        </div>

        {/* Loading text */}
        <div className="text-orange-400 text-lg font-medium tracking-widest">
          <span className="loading-dots">LOADING</span>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-700 rounded-full mt-6 overflow-hidden">
          <div className="progress-bar"></div>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
        <div className="particle particle-6"></div>
      </div>

      <style jsx>{`
        .grid-animation {
          background-image: linear-gradient(
              rgba(255, 165, 0, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(255, 165, 0, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
          animation: gridMove 4s linear infinite;
          width: 100%;
          height: 100%;
        }

        @keyframes gridMove {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        /* Collision lines */
        .line-left {
          position: absolute;
          left: 0;
          top: 0;
          width: 0;
          height: 4px;
          background: linear-gradient(90deg, transparent, #f97316, #fb923c);
          animation: lineLeft 2s ease-in-out infinite;
          border-radius: 2px;
          box-shadow: 0 0 10px #f97316;
        }

        .line-right {
          position: absolute;
          right: 0;
          top: 0;
          width: 0;
          height: 4px;
          background: linear-gradient(-90deg, transparent, #f97316, #fb923c);
          animation: lineRight 2s ease-in-out infinite;
          border-radius: 2px;
          box-shadow: 0 0 10px #f97316;
        }

        .line-top {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: linear-gradient(180deg, transparent, #3b82f6, #60a5fa);
          animation: lineTop 2s ease-in-out infinite 0.3s;
          border-radius: 2px;
          box-shadow: 0 0 10px #3b82f6;
        }

        .line-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: linear-gradient(-180deg, transparent, #3b82f6, #60a5fa);
          animation: lineBottom 2s ease-in-out infinite 0.3s;
          border-radius: 2px;
          box-shadow: 0 0 10px #3b82f6;
        }

        .line-diagonal-1 {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: linear-gradient(135deg, transparent, #10b981, #34d399);
          animation: lineDiagonal1 2s ease-in-out infinite 0.6s;
          border-radius: 2px;
          box-shadow: 0 0 10px #10b981;
          transform-origin: top left;
          transform: rotate(45deg);
        }

        .line-diagonal-2 {
          position: absolute;
          top: 0;
          right: 0;
          width: 4px;
          height: 0;
          background: linear-gradient(135deg, transparent, #10b981, #34d399);
          animation: lineDiagonal2 2s ease-in-out infinite 0.6s;
          border-radius: 2px;
          box-shadow: 0 0 10px #10b981;
          transform-origin: top right;
          transform: rotate(-45deg);
        }

        .line-diagonal-3 {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: linear-gradient(135deg, transparent, #ef4444, #f87171);
          animation: lineDiagonal3 2s ease-in-out infinite 0.9s;
          border-radius: 2px;
          box-shadow: 0 0 10px #ef4444;
          transform-origin: bottom left;
          transform: rotate(-45deg);
        }

        .line-diagonal-4 {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 4px;
          height: 0;
          background: linear-gradient(135deg, transparent, #ef4444, #f87171);
          animation: lineDiagonal4 2s ease-in-out infinite 0.9s;
          border-radius: 2px;
          box-shadow: 0 0 10px #ef4444;
          transform-origin: bottom right;
          transform: rotate(45deg);
        }

        /* Line animations */
        @keyframes lineLeft {
          0% {
            width: 0;
          }
          70% {
            width: 50%;
          }
          100% {
            width: 50%;
          }
        }

        @keyframes lineRight {
          0% {
            width: 0;
          }
          70% {
            width: 50%;
          }
          100% {
            width: 50%;
          }
        }

        @keyframes lineTop {
          0% {
            height: 0;
          }
          70% {
            height: 50%;
          }
          100% {
            height: 50%;
          }
        }

        @keyframes lineBottom {
          0% {
            height: 0;
          }
          70% {
            height: 50%;
          }
          100% {
            height: 50%;
          }
        }

        @keyframes lineDiagonal1 {
          0% {
            height: 0;
          }
          70% {
            height: 141px;
          }
          100% {
            height: 141px;
          }
        }

        @keyframes lineDiagonal2 {
          0% {
            height: 0;
          }
          70% {
            height: 141px;
          }
          100% {
            height: 141px;
          }
        }

        @keyframes lineDiagonal3 {
          0% {
            height: 0;
          }
          70% {
            height: 141px;
          }
          100% {
            height: 141px;
          }
        }

        @keyframes lineDiagonal4 {
          0% {
            height: 0;
          }
          70% {
            height: 141px;
          }
          100% {
            height: 141px;
          }
        }

        /* Collision center */
        .collision-center {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #fff, #f97316, transparent);
          border-radius: 50%;
          animation: collisionPulse 2s ease-in-out infinite 1.4s;
          box-shadow: 0 0 20px #f97316, 0 0 40px #f97316, 0 0 60px #f97316;
        }

        @keyframes collisionPulse {
          0%,
          30% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(2);
            opacity: 1;
          }
          70% {
            transform: scale(1.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(0);
            opacity: 0;
          }
        }

        /* Loading dots */
        .loading-dots::after {
          content: "";
          animation: loadingDots 1.5s steps(4, end) infinite;
        }

        @keyframes loadingDots {
          0%,
          20% {
            content: "";
          }
          40% {
            content: ".";
          }
          60% {
            content: "..";
          }
          80%,
          100% {
            content: "...";
          }
        }

        /* Progress bar */
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #f97316, #fb923c, #f97316);
          border-radius: inherit;
          animation: progressMove 2s ease-in-out infinite;
          box-shadow: 0 0 10px #f97316;
        }

        @keyframes progressMove {
          0% {
            width: 0%;
          }
          70% {
            width: 100%;
          }
          100% {
            width: 100%;
          }
        }

        /* Particles */
        .particle {
          position: absolute;
          width: 3px;
          height: 3px;
          background: #f97316;
          border-radius: 50%;
          opacity: 0.7;
          box-shadow: 0 0 6px #f97316;
        }

        .particle-1 {
          top: 20%;
          left: 10%;
          animation: particleFloat1 3s ease-in-out infinite;
        }

        .particle-2 {
          top: 30%;
          right: 15%;
          animation: particleFloat2 2.5s ease-in-out infinite 0.5s;
        }

        .particle-3 {
          bottom: 25%;
          left: 20%;
          animation: particleFloat3 3.5s ease-in-out infinite 1s;
        }

        .particle-4 {
          bottom: 15%;
          right: 25%;
          animation: particleFloat4 2.8s ease-in-out infinite 1.5s;
        }

        .particle-5 {
          top: 60%;
          left: 5%;
          animation: particleFloat5 3.2s ease-in-out infinite 0.8s;
        }

        .particle-6 {
          top: 70%;
          right: 8%;
          animation: particleFloat6 2.7s ease-in-out infinite 1.2s;
        }

        @keyframes particleFloat1 {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-20px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes particleFloat2 {
          0%,
          100% {
            transform: translateX(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateX(15px) scale(1.1);
            opacity: 1;
          }
        }

        @keyframes particleFloat3 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(10px, -15px) scale(1.3);
            opacity: 1;
          }
        }

        @keyframes particleFloat4 {
          0%,
          100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(25px) scale(1.2);
            opacity: 1;
          }
        }

        @keyframes particleFloat5 {
          0%,
          100% {
            transform: translateX(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateX(-20px) scale(1.1);
            opacity: 1;
          }
        }

        @keyframes particleFloat6 {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(-15px, 10px) scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
