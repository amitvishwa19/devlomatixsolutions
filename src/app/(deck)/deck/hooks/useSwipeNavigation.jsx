import { useState, useCallback } from "react";



export const useSwipeNavigation = ({
    onSwipeLeft,
    onSwipeRight,
    threshold = 50,
}) => {
    const [swipeState, setSwipeState] = useState({
        startX: 0,
        startY: 0,
        isDragging: false,
    });

    const handleTouchStart = useCallback((e) => {
        setSwipeState({
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY,
            isDragging: true,
        });
    }, []);

    const handleTouchEnd = useCallback(
        (e) => {
            if (!swipeState.isDragging) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - swipeState.startX;
            const diffY = endY - swipeState.startY;

            // Only trigger if horizontal swipe is greater than vertical
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    onSwipeRight();
                } else {
                    onSwipeLeft();
                }
            }

            setSwipeState({ startX: 0, startY: 0, isDragging: false });
        },
        [swipeState, threshold, onSwipeLeft, onSwipeRight]
    );

    const handleMouseDown = useCallback((e) => {
        setSwipeState({
            startX: e.clientX,
            startY: e.clientY,
            isDragging: true,
        });
    }, []);

    const handleMouseUp = useCallback(
        (e) => {
            if (!swipeState.isDragging) return;

            const diffX = e.clientX - swipeState.startX;
            const diffY = e.clientY - swipeState.startY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    onSwipeRight();
                } else {
                    onSwipeLeft();
                }
            }

            setSwipeState({ startX: 0, startY: 0, isDragging: false });
        },
        [swipeState, threshold, onSwipeLeft, onSwipeRight]
    );

    return {
        handlers: {
            onTouchStart: handleTouchStart,
            onTouchEnd: handleTouchEnd,
            onMouseDown: handleMouseDown,
            onMouseUp: handleMouseUp,
        },
        isDragging: swipeState.isDragging,
    };
};
