'use client';

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../Effects.css";

type CauseEffect = {
    id: number;
    cause: string;
    effect: string;
};

type EffectsProps = {
    onComplete: () => void;
};

const CAUSE_EFFECT_PAIRS: CauseEffect[] = [
    {
        id: 1,
        cause: "Increase Developer Concentration",
        effect: "Higher development rate",
    },
    {
        id: 2,
        cause: "Decrease Developer Concentration",
        effect: "Lower development rate",
    },
    {
        id: 3,
        cause: "Increase Exposure Time",
        effect: "More resist removal",
    },
    {
        id: 4,
        cause: "Decrease Exposure Time",
        effect: "Incomplete pattern development",
    },
    {
        id: 5,
        cause: "Increase Bake Temperature",
        effect: "Faster solvent evaporation",
    },
    {
        id: 6,
        cause: "Decrease Bake Temperature",
        effect: "Poor resist hardening",
    },
];

function EffectsLED({
    color,
    size = "md",
    pulse = false,
}: {
    color: "green" | "blue" | "red" | "orange";
    size?: "sm" | "md";
    pulse?: boolean;
}) {
    return (
        <span
            className={`effects-led effects-led-${color} ${size === "sm" ? "effects-led-sm" : "effects-led-md"
                } ${pulse ? "effects-led-pulse" : ""}`}
        />
    );
}

export default function Effects({ onComplete }: EffectsProps) {
    const [shuffledEffects, setShuffledEffects] = useState<CauseEffect[]>([]);
    const [selectedCause, setSelectedCause] = useState<number | null>(null);
    const [matched, setMatched] = useState<Set<number>>(new Set());
    const router = useRouter();
    const [wrongPair, setWrongPair] = useState<{
        cause: number;
        effect: number;
    } | null>(null);
    const [completed, setCompleted] = useState<boolean>(false);

    const shuffleEffects = useCallback(() => {
        const effects = [...CAUSE_EFFECT_PAIRS].sort(() => Math.random() - 0.5);

        setShuffledEffects(effects);
        setMatched(new Set());
        setSelectedCause(null);
        setWrongPair(null);
        setCompleted(false);
    }, []);

    useEffect(() => {
        shuffleEffects();
    }, [shuffleEffects]);

    useEffect(() => {
        if (matched.size === CAUSE_EFFECT_PAIRS.length && !completed) {
            setCompleted(true);
            onComplete();
        }
    }, [matched, completed, onComplete]);

    const handleCauseClick = (id: number) => {
        if (matched.has(id)) return;

        setSelectedCause(id);
        setWrongPair(null);
    };

    const handleEffectClick = (effectId: number) => {
        if (selectedCause === null || matched.has(selectedCause)) return;

        if (selectedCause === effectId) {
            setMatched((prev) => new Set([...prev, selectedCause]));
            setSelectedCause(null);
        } else {
            setWrongPair({ cause: selectedCause, effect: effectId });

            setTimeout(() => {
                setWrongPair(null);
                setSelectedCause(null);
            }, 500);
        }
    };

    return (
        <section className="effects-page">
            <header className="effects-smart-header">
                <div className="effects-smart-top">
                    <div className="effects-logo-box">
                        <span className="effects-logo-icon">⬡</span>
                        <span className="effects-logo-text">SMaRT</span>
                    </div>

                    <button className="effects-home-link" onClick={() => router.push("/")}>
                        HOME
                    </button>


                </div>

                <div className="effects-smart-bottom">
                    <h1 className="effects-main-title">
                        SMaRT <span>Simulator</span>
                    </h1>

                    <div className="effects-right-actions">


                        <button
                            className="effects-module-btn"
                            onClick={() => router.push("/Failure")}
                        >
                            Failure Module
                        </button>

                        <button
                            className="effects-module-btn"
                            onClick={() => router.push("/Recipe")}
                        >
                            Recipe Module
                        </button>
                    </div>
                </div>
            </header>
            <div className="effects-container">
                <div className="effects-header">
                    <div className="effects-title-box">
                        <h2 className="effects-title">Cause & Effect Matcher</h2>
                        <p className="effects-subtitle">
                            Match process parameter changes to their physical results
                        </p>
                    </div>

                    <div className="effects-header-actions">
                        <div className="effects-score-box">
                            <span className="effects-score-label">Matched:</span>
                            <span
                                className={`effects-score-value ${matched.size === CAUSE_EFFECT_PAIRS.length
                                    ? "effects-score-complete"
                                    : ""
                                    }`}
                            >
                                {matched.size} / {CAUSE_EFFECT_PAIRS.length}
                            </span>
                        </div>

                        <button className="effects-reset-btn" onClick={shuffleEffects}>
                            Reset
                        </button>
                    </div>
                </div>

                {completed && (
                    <div className="effects-success-box">
                        <EffectsLED color="green" pulse />
                        <span>PARAMETERS MASTERED ✓</span>
                        <EffectsLED color="green" pulse />
                    </div>
                )}

                <div className="effects-grid">
                    <div className="effects-column">
                        <h3 className="effects-column-title effects-cause-title">
                            Cause (Parameter Change)
                        </h3>

                        <div className="effects-card-list">
                            {CAUSE_EFFECT_PAIRS.map((pair) => {
                                const isMatched = matched.has(pair.id);
                                const isSelected = selectedCause === pair.id;
                                const isWrong = wrongPair?.cause === pair.id;

                                return (
                                    <button
                                        key={pair.id}
                                        onClick={() => handleCauseClick(pair.id)}
                                        disabled={isMatched}
                                        className={`effects-card ${isMatched ? "effects-card-matched" : ""
                                            } ${isSelected ? "effects-card-selected" : ""} ${isWrong ? "effects-card-wrong" : ""
                                            }`}
                                    >
                                        <EffectsLED
                                            color={
                                                isMatched
                                                    ? "green"
                                                    : isSelected
                                                        ? "blue"
                                                        : isWrong
                                                            ? "red"
                                                            : "orange"
                                            }
                                            size="sm"
                                        />
                                        <span>{pair.cause}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="effects-column">
                        <h3 className="effects-column-title effects-result-title">
                            Effect (Physical Result)
                        </h3>

                        <div className="effects-card-list">
                            {shuffledEffects.map((pair) => {
                                const isMatched = matched.has(pair.id);
                                const isWrong = wrongPair?.effect === pair.id;

                                return (
                                    <button
                                        key={pair.id}
                                        onClick={() => handleEffectClick(pair.id)}
                                        disabled={isMatched || selectedCause === null}
                                        className={`effects-card ${isMatched ? "effects-card-matched" : ""
                                            } ${isWrong ? "effects-card-wrong" : ""} ${selectedCause === null && !isMatched
                                                ? "effects-card-disabled"
                                                : ""
                                            }`}
                                    >
                                        <EffectsLED
                                            color={isMatched ? "green" : isWrong ? "red" : "orange"}
                                            size="sm"
                                        />
                                        <span>{pair.effect}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}