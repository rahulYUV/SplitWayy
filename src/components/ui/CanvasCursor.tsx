'use client';

import useCanvasCursor from '@/hooks/use-canvasCursor';

interface CanvasCursorProps {
    containerId: string;
}

const CanvasCursor = ({ containerId }: CanvasCursorProps) => {
    useCanvasCursor(containerId);

    // Z-index high to be on top, pointer-events-none to let clicks pass through
    return (
        <canvas
            className='pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-300'
            id='canvas-cursor'
            style={{ opacity: 0 }} // Start hidden
        />
    );
};
export default CanvasCursor;
