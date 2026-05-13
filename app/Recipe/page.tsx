"use client";
// Recipe.tsx
import React, { useState, useEffect } from 'react';
import '../Recipe.css';

type RecipeType = 'PEB Temperature Drift' | 'Resist Dispense Bubble' | 'EBR Nozzle Clog/Misalign' | 'Exhaust Fan Failure' | 'Developer Concentration';

interface RecipeStep {
  id: string;
  name: string;
  description: string;
  order: number;
}

const recipeStepsData: Record<RecipeType, RecipeStep[]> = {
  'PEB Temperature Drift': [
    { id: 'step1', name: 'Pre-Bake / Dehydration Bake', description: 'Thermally desorbs adsorbed water molecules from the wafer surface.', order: 1 },
    { id: 'step2', name: 'HMDS Vapor Prime', description: 'Silylation reaction to convert surface to hydrophobic.', order: 2 },
    { id: 'step3', name: 'Photoresist Coating', description: 'Spin coating of photoresist onto wafer surface.', order: 3 },
    { id: 'step4', name: 'Soft Bake / PAB', description: 'Evaporates casting solvent to solidify the film.', order: 4 },
    { id: 'step5', name: 'Exposure (Scanner)', description: 'Pattern transfer via light exposure.', order: 5 },
    { id: 'step6', name: 'Post-Exposure Bake (PEB)', description: 'Acid-catalyzed deprotection reaction.', order: 6 },
    { id: 'step7', name: 'Development', description: 'Selective dissolution of exposed resist.', order: 7 },
    { id: 'step8', name: 'Hard Bake', description: 'Cross-linking for mechanical stability.', order: 8 }
  ],
  'Resist Dispense Bubble': [
    { id: 'step1', name: 'Wafer Loading (EFEM)', description: 'FOUP opening and wafer mapping.', order: 1 },
    { id: 'step2', name: 'Dehydration Bake', description: 'Surface moisture removal.', order: 2 },
    { id: 'step3', name: 'Adhesion Promoter (HMDS)', description: 'Primer application.', order: 3 },
    { id: 'step4', name: 'Resist Dispense', description: 'Bubble-free photoresist application.', order: 4 },
    { id: 'step5', name: 'Spin Speed Ramp', description: 'Thickness uniformity control.', order: 5 },
    { id: 'step6', name: 'Edge Bead Removal', description: 'Peripheral resist removal.', order: 6 },
    { id: 'step7', name: 'Soft Bake', description: 'Solvent evaporation.', order: 7 }
  ],
  'EBR Nozzle Clog/Misalign': [
    { id: 'step1', name: 'Mount Wafer on Chuck', description: 'Vacuum securement.', order: 1 },
    { id: 'step2', name: 'Resist Dispense', description: 'Center dispense of photoresist.', order: 2 },
    { id: 'step3', name: 'Spin to Spread', description: 'Low RPM spread cycle.', order: 3 },
    { id: 'step4', name: 'Spin to Thickness', description: 'High RPM final thickness.', order: 4 },
    { id: 'step5', name: 'EBR Application', description: 'Edge bead removal solvent spray.', order: 5 },
    { id: 'step6', name: 'Backside Rinse', description: 'Clean wafer backside.', order: 6 }
  ],
  'Exhaust Fan Failure': [
    { id: 'step1', name: 'Load Wafer', description: 'Transfer to coater bowl.', order: 1 },
    { id: 'step2', name: 'Dispense Resist', description: 'Chemical application.', order: 2 },
    { id: 'step3', name: 'Spin Cycle', description: 'Film thickness generation.', order: 3 },
    { id: 'step4', name: 'Exhaust Flow', description: 'Solvent vapor removal.', order: 4 },
    { id: 'step5', name: 'Edge Bead Removal', description: 'Solvent application.', order: 5 },
    { id: 'step6', name: 'Transfer to Hotplate', description: 'Soft bake transfer.', order: 6 }
  ],
  'Developer Concentration': [
    { id: 'step1', name: 'Post-Exposure Bake', description: 'Chemical amplification.', order: 1 },
    { id: 'step2', name: 'Cool Down', description: 'Temperature stabilization.', order: 2 },
    { id: 'step3', name: 'Developer Dispense', description: 'TMAH application.', order: 3 },
    { id: 'step4', name: 'Puddle Development', description: 'Selective dissolution.', order: 4 },
    { id: 'step5', name: 'DI Water Rinse', description: 'Development stop.', order: 5 },
    { id: 'step6', name: 'Spin Dry', description: 'Wafer drying.', order: 6 },
    { id: 'step7', name: 'Hard Bake', description: 'Final cross-linking.', order: 7 }
  ]
};

const Recipe: React.FC = () => {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeType>('PEB Temperature Drift');
  const [randomSteps, setRandomSteps] = useState<RecipeStep[]>([]);
  const [userSequence, setUserSequence] = useState<RecipeStep[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Shuffle array function
  const shuffleArray = (array: RecipeStep[]): RecipeStep[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate random sequence with 3-5 wrong steps (positions swapped)
  const generateRandomSequence = (correctSteps: RecipeStep[]): RecipeStep[] => {
    const shuffled = shuffleArray(correctSteps);
    const numWrong = Math.floor(Math.random() * 3) + 3; // 3 to 5 wrong placements
    for (let i = 0; i < numWrong && i < shuffled.length - 1; i++) {
      const swapIndex = Math.floor(Math.random() * (shuffled.length - 1)) + 1;
      [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize or reset sequence when recipe changes
  useEffect(() => {
    const correctSteps = recipeStepsData[selectedRecipe];
    const randomSeq = generateRandomSequence(correctSteps);
    setRandomSteps(randomSeq);
    setUserSequence([]);
    setIsCorrect(null);
  }, [selectedRecipe]);

  // Handle step click from random steps (add to user sequence)
  const handleStepClick = (step: RecipeStep, index: number) => {
    if (isCorrect === true) return;
    
    // Check if step already in user sequence
    if (userSequence.some(s => s.id === step.id)) return;
    
    setUserSequence([...userSequence, step]);
    setRandomSteps(randomSteps.filter((_, i) => i !== index));
  };

  // Remove step from user sequence
  const handleRemoveStep = (step: RecipeStep, index: number) => {
    if (isCorrect === true) return;
    
    setRandomSteps([...randomSteps, step]);
    setUserSequence(userSequence.filter((_, i) => i !== index));
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, step: RecipeStep, fromUserSeq: boolean, index: number) => {
    if (isCorrect === true) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ step, fromUserSeq, index }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(targetId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetFromUserSeq: boolean, targetIndex?: number) => {
    e.preventDefault();
    setDragOverId(null);
    if (isCorrect === true) return;

    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { step, fromUserSeq, index: sourceIndex } = data;

    if (fromUserSeq) {
      // Moving from user sequence to random steps
      setUserSequence(userSequence.filter((_, i) => i !== sourceIndex));
      setRandomSteps([...randomSteps, step]);
    } else {
      // Moving from random steps to user sequence
      if (targetFromUserSeq) {
        // Insert at specific position in user sequence
        const newUserSeq = [...userSequence];
        if (targetIndex !== undefined && targetIndex >= 0) {
          newUserSeq.splice(targetIndex, 0, step);
        } else {
          newUserSeq.push(step);
        }
        setUserSequence(newUserSeq);
        setRandomSteps(randomSteps.filter((_, i) => i !== sourceIndex));
      } else {
        // Just reorder within random steps? Not needed for now
        setUserSequence([...userSequence, step]);
        setRandomSteps(randomSteps.filter((_, i) => i !== sourceIndex));
      }
    }
  };

  // Check sequence correctness
  const checkSequence = () => {
    const correctSteps = recipeStepsData[selectedRecipe];
    const isSeqCorrect = userSequence.length === correctSteps.length &&
      userSequence.every((step, idx) => step.id === correctSteps[idx].id);
    setIsCorrect(isSeqCorrect);
  };

  // Reset the exercise
  const resetSequence = () => {
    const correctSteps = recipeStepsData[selectedRecipe];
    const randomSeq = generateRandomSequence(correctSteps);
    setRandomSteps(randomSeq);
    setUserSequence([]);
    setIsCorrect(null);
  };

  // Toggle dark mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }, [isDarkMode]);

  // Get correct order steps for reference
  const correctSteps = recipeStepsData[selectedRecipe];

  return (
    <div className={`recipe-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="recipe-header">
        <h1 className="recipe-title">Photoresist Coater-Developer Track</h1>
        <div className="header-controls">
          <button 
            className="theme-toggle"
            onClick={() => setIsDarkMode(!isDarkMode)}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div className="recipe-selector">
            <label htmlFor="recipe-select">Select Recipe: </label>
            <select
              id="recipe-select"
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value as RecipeType)}
              disabled={isCorrect === true}
            >
              <option value="PEB Temperature Drift">PEB Temperature Drift</option>
              <option value="Resist Dispense Bubble">Resist Dispense Bubble</option>
              <option value="EBR Nozzle Clog/Misalign">EBR Nozzle Clog/Misalign</option>
              <option value="Exhaust Fan Failure">Exhaust Fan Failure</option>
              <option value="Developer Concentration">Developer Concentration</option>
            </select>
          </div>
        </div>
      </div>

      <div className="recipe-description">
        <p>Arrange the process steps in the correct chronological order. Drag and drop or click steps to build the sequence.</p>
        <div className="status-indicator">
          <div className={`status-led ${isCorrect === true ? 'green' : isCorrect === false ? 'red' : 'gray'}`}></div>
          <span>
            {isCorrect === null ? 'Sequence not validated' : isCorrect ? '✓ Correct Sequence!' : '✗ Incorrect Sequence'}
          </span>
        </div>
      </div>

      <div className="sequence-container">
        <div className="available-steps-panel">
          <h2>Available Steps</h2>
          <div className="steps-grid">
            {randomSteps.map((step, idx) => (
              <div
                key={step.id}
                className="step-card draggable"
                draggable={isCorrect !== true}
                onDragStart={(e) => handleDragStart(e, step, false, idx)}
                onDragOver={(e) => handleDragOver(e, `random-${step.id}`)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, false)}
                onClick={() => handleStepClick(step, idx)}
              >
                <div className="step-order">{idx + 1}</div>
                <div className="step-content">
                  <h3>{step.name}</h3>
                  <p>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="user-sequence-panel">
          <h2>Your Sequence (Correct Order)</h2>
          <div 
            className="sequence-list"
            onDragOver={(e) => handleDragOver(e, 'user-sequence')}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, true)}
          >
            {userSequence.length === 0 ? (
              <div className="empty-sequence">
                <p>Drop steps here to build sequence</p>
              </div>
            ) : (
              userSequence.map((step, idx) => (
                <div
                  key={step.id}
                  className={`step-card sequence-step ${dragOverId === `user-${step.id}` ? 'drag-over' : ''}`}
                  draggable={isCorrect !== true}
                  onDragStart={(e) => handleDragStart(e, step, true, idx)}
                  onDragOver={(e) => handleDragOver(e, `user-${step.id}`)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, true, idx)}
                >
                  <div className="step-order">{idx + 1}</div>
                  <div className="step-content">
                    <h3>{step.name}</h3>
                    <p>{step.description}</p>
                  </div>
                  {isCorrect !== true && (
                    <button 
                      className="remove-btn"
                      onClick={() => handleRemoveStep(step, idx)}
                      aria-label="Remove step"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="btn btn-primary" 
          onClick={checkSequence}
          disabled={userSequence.length !== randomSteps.length + userSequence.length}
        >
          Validate Sequence
        </button>
        <button className="btn btn-secondary" onClick={resetSequence}>
          Reset
        </button>
      </div>

      {isCorrect === true && (
        <div className="success-message">
          <h3>✅ Recipe Sequence Correct!</h3>
          <p>The tool is now ready for production. LED is GREEN.</p>
        </div>
      )}
      {isCorrect === false && (
        <div className="error-message">
          <h3>⚠️ Incorrect Sequence</h3>
          <p>Please review the process flow and try again. LED is RED.</p>
          <button className="btn btn-secondary" onClick={resetSequence}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Recipe;
