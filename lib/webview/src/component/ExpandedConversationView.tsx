import { webviewApi } from "@rubberduck/common";
import React, { useState } from "react";
import { ConversationHeader } from "./ConversationHeader";
import { InstructionRefinementView } from "./InstructionRefinementView";
import { MessageExchangeView } from "./MessageExchangeView";
import { PSControls } from "./PSControls";

export const ExpandedConversationView: React.FC<{
  conversation: webviewApi.Conversation;
  onSendMessage: (message: string) => void;
  onClickDismissError: () => void;
  onClickRetry: () => void;
  onClickDelete: () => void;
  onClickExport: () => void;
  onClickInsertPrompt?: () => void;
  onUpdateMode?: (mode: "debug" | "explain" | "learn" | "reveal") => void;
  onUpdateHintLevel?: (level: number) => void;
}> = ({
  conversation,
  onSendMessage,
  onClickDismissError,
  onClickRetry,
  onClickDelete,
  onClickExport,
  onClickInsertPrompt,
  onUpdateMode,
  onUpdateHintLevel,
}) => {
    const content = conversation.content;
    const [mode, setMode] = useState<"debug" | "explain" | "learn" | "reveal">(
      conversation.mode || "debug"
    );
    const [hintLevel, setHintLevel] = useState<number>(
      conversation.hintLevel ?? 1
    );

    const handleModeChange = (newMode: "debug" | "explain" | "learn" | "reveal") => {
      setMode(newMode);
      onUpdateMode?.(newMode);
    };

    const handleHintLevelChange = (newLevel: number) => {
      setHintLevel(newLevel);
      onUpdateHintLevel?.(newLevel);
    };

    return (
      <div className={`conversation expanded`}>
        {
          onClickInsertPrompt ?
            (<ConversationHeader conversation={conversation} onIconClick={onClickInsertPrompt} />)
            : (<ConversationHeader conversation={conversation} />)
        }

        {/* PS Controls - only show if mode/hintLevel are present */}
        {(conversation.mode !== undefined || conversation.hintLevel !== undefined) && (
          <PSControls
            mode={mode}
            hintLevel={hintLevel}
            onModeChange={handleModeChange}
            onHintLevelChange={handleHintLevelChange}
            disabled={content.type === "messageExchange" && content.state.type !== "userCanReply"}
          />
        )}

        {(() => {
          const type = content.type;
          switch (type) {
            case "messageExchange":
              return (
                <MessageExchangeView
                  content={content}
                  onSendMessage={onSendMessage}
                  onClickDismissError={onClickDismissError}
                  onClickRetry={onClickRetry}
                />
              );
            case "instructionRefinement":
              return (
                <InstructionRefinementView
                  content={content}
                  onSendMessage={onSendMessage}
                  onClickDismissError={onClickDismissError}
                  onClickRetry={onClickRetry}
                />
              );
            default: {
              const exhaustiveCheck: never = type;
              throw new Error(`unsupported type: ${exhaustiveCheck}`);
            }
          }
        })()}

        <div className="footer">
          <span className="action-panel">
            <i
              className="codicon codicon-save inline action-export"
              title="Export conversation"
              onClick={onClickExport}
            />
            <i
              className="codicon codicon-trash inline action-delete"
              title="Delete conversation"
              onClick={onClickDelete}
            />
          </span>
        </div>
      </div>
    );
  };
