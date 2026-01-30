import React from 'react';
import { personality } from '@rubberduck/common';

const { CHARACTERS } = personality;
type Character = personality.Character;
type CharacterInfo = personality.CharacterInfo;

interface CharacterCardProps {
    character: CharacterInfo;
    selected: boolean;
    onSelect: (id: Character) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, selected, onSelect }) => {
    return (
        <div
            className={`character-card ${selected ? 'selected' : ''} ${character.id}`}
            onClick={() => onSelect(character.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelect(character.id)}
        >
            <div className="character-avatar">
                <img
                    src={`${(window as any).assetBaseUri}/${character.image}`}
                    alt={character.name}
                    className="avatar-image"
                />
            </div>
            <div className="character-info">
                <h3 className="character-name">{character.name}</h3>
                <p className="character-subtitle">{character.subtitle}</p>
                <p className="character-description">{character.description}</p>
            </div>
            {selected && <div className="selected-indicator">✓</div>}
        </div>
    );
};

interface OnboardingProps {
    onCharacterSelect: (character: Character) => void;
    onStartSurvey: () => void;
    selectedCharacter?: Character;
}

export const Onboarding: React.FC<OnboardingProps> = ({
    onCharacterSelect,
    onStartSurvey,
    selectedCharacter,
}) => {
    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <h1>Welcome to FutureGirlfriend PS</h1>
                <p>Choose your debugging partner from the future</p>
            </div>

            <div className="character-selection">
                {(Object.values(CHARACTERS) as CharacterInfo[]).map((char) => (
                    <CharacterCard
                        key={char.id}
                        character={char}
                        selected={selectedCharacter === char.id}
                        onSelect={onCharacterSelect}
                    />
                ))}
            </div>

            <div className="onboarding-actions">
                <button
                    className="primary-button"
                    onClick={onStartSurvey}
                    disabled={!selectedCharacter}
                >
                    {selectedCharacter ? 'Next: Personality Calibration →' : 'Select a Partner'}
                </button>
            </div>

            <div className="onboarding-note">
                <p>Your partner will learn your personality to provide personalized support</p>
            </div>
        </div>
    );
};

export default Onboarding;
