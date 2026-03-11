import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useAppContext } from './AppContext';

export const CelebrationManager: React.FC = () => {
    const { userData, currentWater, meals, quickAddProtein } = useAppContext();
    
    const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0) + quickAddProtein;

    const prevWaterRef = useRef(currentWater);
    const prevProteinRef = useRef(totalProtein);
    const isReady = useRef(false);

    useEffect(() => {
        if (!userData) return;

        if (!isReady.current) {
            isReady.current = true;
            prevWaterRef.current = currentWater;
            prevProteinRef.current = totalProtein;
            return;
        }

        // Water celebration
        if (currentWater >= userData.goals.water && prevWaterRef.current < userData.goals.water) {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#60a5fa', '#93c5fd'], // Water colors
                zIndex: 9999
            });
        }
        prevWaterRef.current = currentWater;
    }, [currentWater, userData, userData?.goals?.water]);

    useEffect(() => {
        if (!userData || !isReady.current) return;

        // Protein celebration
        if (totalProtein >= userData.goals.protein && prevProteinRef.current < userData.goals.protein) {
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#f97316', '#fb923c', '#fdba74'], // Protein colors
                zIndex: 9999
            });
        }
        prevProteinRef.current = totalProtein;
    }, [totalProtein, userData, userData?.goals?.protein]);

    return null;
};
