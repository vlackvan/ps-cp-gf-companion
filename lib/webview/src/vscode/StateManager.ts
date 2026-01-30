import { webviewApi } from "@rubberduck/common";
import { vscodeApi } from "./VsCodeApi";

let state: webviewApi.PanelState = undefined;
let updateListener: ((state: webviewApi.PanelState) => void) | undefined =
  undefined;

// safely load state from VS Code
const loadedState = vscodeApi.getState<unknown>();
try {
  state = webviewApi.panelStateSchema.parse(loadedState);
} catch (error) {
  console.log({
    loadedState,
    error,
  });
}

const updateState = (newState: webviewApi.PanelState) => {
  console.log("[FutureGirlfriendPS] StateManager.updateState called", {
    stateType: newState?.type,
    conversationCount:
      newState?.type === "chat" ? newState.conversations?.length : "N/A",
    selectedId:
      newState?.type === "chat" ? newState.selectedConversationId : "N/A",
    hasUpdateListener: updateListener != null,
  });
  vscodeApi.setState(newState);
  state = newState;

  if (updateListener != null) {
    console.log("[FutureGirlfriendPS] StateManager calling updateListener");
    updateListener(state);
  }
};

window.addEventListener("message", (rawMessage: unknown) => {
  console.log("[FutureGirlfriendPS] StateManager received message", rawMessage);
  try {
    const event = webviewApi.incomingMessageSchema.parse(rawMessage);

    const message = event.data;
    if (message.type === "updateState") {
      updateState(message.state);
    }
  } catch (error) {
    console.error(
      "[FutureGirlfriendPS] StateManager failed to parse message",
      error
    );
  }
});

// exposed as Singleton that is managed outside of React
// (to prevent schema change errors from breaking the UI)

export const registerUpdateListener = (
  listener: (state: webviewApi.PanelState) => void
) => {
  updateListener = listener;
};

export const getState = () => state;
