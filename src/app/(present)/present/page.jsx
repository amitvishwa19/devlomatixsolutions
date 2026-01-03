'use client'
import React, { useState } from 'react'

const slides = [
    { id: 1, component: TitleSlide },
    { id: 2, component: ProblemSlide },
    { id: 3, component: SolutionSlide },
    { id: 4, component: FeaturesSlide },
    { id: 5, component: FunctionalAreasSlide },
    { id: 6, component: TargetUsersSlide },
    { id: 7, component: SecuritySlide },
    { id: 8, component: MetricsSlide },
    { id: 9, component: PricingSlide },
    { id: 10, component: CTASlide },
];

const slideVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 1000 : -1000,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction) => ({
        x: direction < 0 ? 1000 : -1000,
        opacity: 0,
    }),
};


export default function page() {
    const [[currentSlide, direction], setSlide] = useState([0, 0]);
    const [isAnimating, setIsAnimating] = useState(false);

    const paginate = useCallback(
        (newDirection) => {
            if (isAnimating) return;

            const nextSlide = currentSlide + newDirection;
            if (nextSlide >= 0 && nextSlide < slides.length) {
                setSlide([nextSlide, newDirection]);
            }
        },
        [currentSlide, isAnimating]
    );

    const goToSlide = useCallback(
        (index) => {
            if (isAnimating || index === currentSlide) return;
            const newDirection = index > currentSlide ? 1 : -1;
            setSlide([index, newDirection]);
        },
        [currentSlide, isAnimating]
    );

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight" || e.key === " ") {
                e.preventDefault();
                paginate(1);
            } else if (e.key === "ArrowLeft") {
                e.preventDefault();
                paginate(-1);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [paginate]);

    // Touch/swipe navigation
    useEffect(() => {
        let touchStartX = 0;

        const handleTouchStart = (e) => {
            touchStartX = e.touches[0].clientX;
        };

        const handleTouchEnd = (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    paginate(1);
                } else {
                    paginate(-1);
                }
            }
        };

        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
        };
    }, [paginate]);


    return (
        <div>page</div>
    )
}
