import React from 'react';

const LavaBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[-1] bg-black overflow-hidden pointer-events-none">
            <div className="absolute inset-0 filter blur-[100px] opacity-100">
                {/* Lava Blobs - Using bright, intense warm colors for the 'Lava' look */}
                <div
                    className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#ff4800] rounded-full mix-blend-screen animate-blob opacity-80"
                />
                <div
                    className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#ffec00] rounded-full mix-blend-screen animate-blob opacity-80"
                    style={{ animationDelay: '2s', animationDirection: 'reverse' }}
                />
                <div
                    className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-[#ff0000] rounded-full mix-blend-screen animate-blob opacity-80"
                    style={{ animationDelay: '4s' }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#ff8800] rounded-full mix-blend-screen animate-blob opacity-80"
                    style={{ animationDelay: '6s', animationDuration: '9s' }}
                />
                <div
                    className="absolute top-[40%] left-[40%] w-[30vw] h-[30vw] bg-[#ff5e00] rounded-full mix-blend-screen animate-blob opacity-90"
                    style={{ animationDelay: '3s', animationDuration: '8s' }}
                />
            </div>

            {/* Texture overlay to make it look less 'flat' */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

            {/* SVG Filter for the Gooey Effect (Optional, but adds to the liquid feel) */}
            <svg className="hidden">
                <filter id="goo">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </svg>
        </div>
    );
};

export default LavaBackground;
