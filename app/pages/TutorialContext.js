// src/app/pages/TutorialContext.js
import React, { createContext, useState } from 'react';

export const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [tourStep, setTourStep] = useState(0);
  const [runTour, setRunTour] = useState(true);

  const goToNextPage = (nextPage, nextStep) => {
    setTourStep(nextStep);
    window.location.href = nextPage;
  };

  return (
    <TutorialContext.Provider value={{ tourStep, setTourStep, runTour, setRunTour, goToNextPage }}>
      {children}
    </TutorialContext.Provider>
  );
};
