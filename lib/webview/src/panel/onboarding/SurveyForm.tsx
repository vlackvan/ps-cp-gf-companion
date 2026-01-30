import React, { useState } from 'react';
import { personality } from '@rubberduck/common';

const { BFI_QUESTIONS, PVQ_QUESTIONS } = personality;
type UserProfile = personality.UserProfile;

interface SurveyFormProps {
    onComplete: (
        userProfile: UserProfile,
        bfiResponses: number[],
        pvqResponses: number[]
    ) => void;
    onBack: () => void;
}

export const SurveyForm: React.FC<SurveyFormProps> = ({ onComplete, onBack }) => {
    const [step, setStep] = useState<'demographics' | 'bfi' | 'pvq'>('demographics');

    // Demographics
    const [age, setAge] = useState<number>(20);
    const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
    const [residence, setResidence] = useState<string>('');

    // Survey responses
    const [bfiResponses, setBfiResponses] = useState<number[]>(Array(30).fill(0));
    const [pvqResponses, setPvqResponses] = useState<number[]>(Array(40).fill(0));

    // Current question index for progressive display
    const [bfiIndex, setBfiIndex] = useState(0);
    const [pvqIndex, setPvqIndex] = useState(0);

    const handleDemographicsSubmit = () => {
        if (age > 0 && residence.trim()) {
            setStep('bfi');
        }
    };

    const handleBfiResponse = (value: number) => {
        const newResponses = [...bfiResponses];
        newResponses[bfiIndex] = value;
        setBfiResponses(newResponses);

        if (bfiIndex < 29) {
            setBfiIndex(bfiIndex + 1);
        } else {
            setStep('pvq');
        }
    };

    const handlePvqResponse = (value: number) => {
        const newResponses = [...pvqResponses];
        newResponses[pvqIndex] = value;
        setPvqResponses(newResponses);

        if (pvqIndex < 39) {
            setPvqIndex(pvqIndex + 1);
        } else {
            // Complete survey
            onComplete({ age, gender, residence }, bfiResponses, pvqResponses);
        }
    };

    const goBackQuestion = () => {
        if (step === 'bfi' && bfiIndex > 0) {
            setBfiIndex(bfiIndex - 1);
        } else if (step === 'pvq' && pvqIndex > 0) {
            setPvqIndex(pvqIndex - 1);
        } else if (step === 'pvq' && pvqIndex === 0) {
            setStep('bfi');
            setBfiIndex(29);
        } else if (step === 'bfi' && bfiIndex === 0) {
            setStep('demographics');
        } else {
            onBack();
        }
    };

    const getProgress = (): number => {
        if (step === 'demographics') return 0;
        if (step === 'bfi') return ((bfiIndex + 1) / 70) * 100;
        return ((30 + pvqIndex + 1) / 70) * 100;
    };

    return (
        <div className="survey-container">
            <div className="survey-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${getProgress()}%` }}
                    />
                </div>
                <span className="progress-text">
                    {step === 'demographics' && 'Step 1/3: About You'}
                    {step === 'bfi' && `Step 2/3: Personality (${bfiIndex + 1}/30)`}
                    {step === 'pvq' && `Step 3/3: Values (${pvqIndex + 1}/40)`}
                </span>
            </div>

            {step === 'demographics' && (
                <div className="survey-step demographics">
                    <h2>Tell us about yourself</h2>
                    <p className="survey-description">
                        This helps your partner understand you better
                    </p>

                    <div className="form-group">
                        <label htmlFor="age">Age</label>
                        <input
                            id="age"
                            type="number"
                            min="13"
                            max="99"
                            value={age}
                            onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Gender</label>
                        <div className="radio-group">
                            {(['male', 'female', 'other'] as const).map((g) => (
                                <label key={g} className="radio-option">
                                    <input
                                        type="radio"
                                        name="gender"
                                        checked={gender === g}
                                        onChange={() => setGender(g)}
                                    />
                                    {g.charAt(0).toUpperCase() + g.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="residence">Where do you live?</label>
                        <input
                            id="residence"
                            type="text"
                            placeholder="City, Country"
                            value={residence}
                            onChange={(e) => setResidence(e.target.value)}
                        />
                    </div>

                    <div className="survey-actions">
                        <button className="secondary-button" onClick={onBack}>
                            ← Back
                        </button>
                        <button
                            className="primary-button"
                            onClick={handleDemographicsSubmit}
                            disabled={age < 13 || !residence.trim()}
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}

            {step === 'bfi' && (
                <div className="survey-step bfi">
                    <h2>I am someone who...</h2>
                    <p className="survey-description">
                        Rate how much you agree with each statement (1-5)
                    </p>

                    <div className="question-card">
                        <p className="question-text">
                            {bfiIndex + 1}. {BFI_QUESTIONS[bfiIndex]}
                        </p>

                        <div className="likert-scale">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    className={`likert-option ${bfiResponses[bfiIndex] === value ? 'selected' : ''}`}
                                    onClick={() => handleBfiResponse(value)}
                                >
                                    <span className="likert-value">{value}</span>
                                    <span className="likert-label">
                                        {value === 1 && 'Strongly Disagree'}
                                        {value === 2 && 'Disagree'}
                                        {value === 3 && 'Neutral'}
                                        {value === 4 && 'Agree'}
                                        {value === 5 && 'Strongly Agree'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="survey-actions">
                        <button className="secondary-button" onClick={goBackQuestion}>
                            ← Back
                        </button>
                    </div>
                </div>
            )}

            {step === 'pvq' && (
                <div className="survey-step pvq">
                    <h2>What matters to you?</h2>
                    <p className="survey-description">
                        Rate how much this person is like you (1-6)
                    </p>

                    <div className="question-card">
                        <p className="question-text">
                            {pvqIndex + 1}. {PVQ_QUESTIONS[pvqIndex].replace(/\bhe\b/gi, gender === 'female' ? 'she' : 'they').replace(/\bhim\b/gi, gender === 'female' ? 'her' : 'them').replace(/\bhis\b/gi, gender === 'female' ? 'her' : 'their')}
                        </p>

                        <div className="likert-scale likert-6">
                            {[1, 2, 3, 4, 5, 6].map((value) => (
                                <button
                                    key={value}
                                    className={`likert-option ${pvqResponses[pvqIndex] === value ? 'selected' : ''}`}
                                    onClick={() => handlePvqResponse(value)}
                                >
                                    <span className="likert-value">{value}</span>
                                    <span className="likert-label">
                                        {value === 1 && 'Not at all'}
                                        {value === 2 && 'Not like me'}
                                        {value === 3 && 'A little'}
                                        {value === 4 && 'Somewhat'}
                                        {value === 5 && 'Like me'}
                                        {value === 6 && 'Very much'}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="survey-actions">
                        <button className="secondary-button" onClick={goBackQuestion}>
                            ← Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SurveyForm;
