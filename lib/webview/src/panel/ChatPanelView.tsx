import { webviewApi, personality } from "@rubberduck/common";
import React, { useState, useEffect } from "react";
import { SendMessage } from "../vscode/SendMessage";
import { Onboarding, SurveyForm } from "./onboarding";
import { SimpleChatView } from "../component/SimpleChatView";

const {
  CHARACTERS,
  calculatePersonalityProfile,
} = personality;

type Character = personality.Character;
type UserProfile = personality.UserProfile;
type SurveyStep = personality.SurveyStep;


export const ChatPanelView: React.FC<{
  sendMessage: SendMessage;
  panelState: webviewApi.PanelState;
}> = ({ panelState, sendMessage }) => {
  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState<SurveyStep>('character');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | undefined>();
  const [userProfile, setUserProfile] = useState<UserProfile | undefined>();

  // Auto-start chat after onboarding completes - MUST be before any returns!
  useEffect(() => {
    if (onboardingStep === 'complete') {
      // Check if we need to start a new chat
      if (panelState == null ||
        (panelState.type === "chat" && panelState.conversations.length === 0)) {
        sendMessage({ type: "startChat" });
      }
    }
  }, [onboardingStep, panelState, sendMessage]);

  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleStartSurvey = () => {
    if (selectedCharacter) {
      setOnboardingStep('demographics');
    }
  };

  const handleSurveyComplete = (
    profile: UserProfile,
    bfiResponses: number[],
    pvqResponses: number[]
  ) => {
    setUserProfile(profile);
    const personalityProfile = calculatePersonalityProfile(bfiResponses, pvqResponses);

    // Send to extension to persist
    sendMessage({
      type: "onboardingComplete",
      data: {
        character: selectedCharacter,
        userProfile: profile,
        personalityProfile,
      },
    } as any);

    // Move to complete step which triggers chat start
    setOnboardingStep('complete');
  };

  const handleBackToCharacterSelect = () => {
    setOnboardingStep('character');
  };

  // Show onboarding flow - character selection
  if (onboardingStep === 'character') {
    return (
      <Onboarding
        selectedCharacter={selectedCharacter}
        onCharacterSelect={handleCharacterSelect}
        onStartSurvey={handleStartSurvey}
      />
    );
  }

  // Show survey form
  if (onboardingStep === 'demographics' || onboardingStep === 'bfi' || onboardingStep === 'pvq') {
    return (
      <SurveyForm
        onComplete={handleSurveyComplete}
        onBack={handleBackToCharacterSelect}
      />
    );
  }

  // After onboarding complete - wait for panelState
  if (panelState == null) {
    return <div className="loading-chat">Loading chat...</div>;
  }

  if (panelState.type !== "chat") {
    return <div className="loading-chat">Initializing...</div>;
  }

  if (panelState.conversations.length === 0) {
    return <div className="loading-chat">Starting conversation...</div>;
  }

  // Get the selected conversation
  const selectedConversation = panelState.conversations.find(
    c => c.id === panelState.selectedConversationId
  );

  if (!selectedConversation) {
    return <div className="loading-chat">Loading conversation...</div>;
  }

  return (
    <SimpleChatView
      conversation={selectedConversation}
      character={selectedCharacter}
      onSendMessage={(message: string) =>
        sendMessage({
          type: "sendMessage",
          data: {
            id: selectedConversation.id,
            message,
            mode: selectedConversation.mode,
            hintLevel: selectedConversation.hintLevel,
          },
        })
      }
    />
  );
};
