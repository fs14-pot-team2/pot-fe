"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import MessageModal, {
  type MessageUser,
} from "@/components/common/Message/MessageModal/MessageModal";

import { useAuth } from "@/lib/auth/AuthProvider";

type PanelState =
  | {
      mode: "list";
      key: number;
    }
  | {
      mode: "conversation";
      user: MessageUser;
      key: number;
    }
  | null;

interface MessagePanelContextValue {
  isOpen: boolean;
  openList: () => void;
  openConversation: (user: MessageUser) => void;
  closePanel: () => void;
  toggleList: () => void;
}

const MessagePanelContext = createContext<MessagePanelContextValue | null>(null);

function MessagePanelState({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  const [panel, setPanel] = useState<PanelState>(null);
  const nextKeyRef = useRef(0);

  const createKey = useCallback(() => {
    nextKeyRef.current += 1;
    return nextKeyRef.current;
  }, []);

  const openList = useCallback(() => {
    setPanel({
      mode: "list",
      key: createKey(),
    });
  }, [createKey]);

  const openConversation = useCallback(
    (user: MessageUser) => {
      setPanel({
        mode: "conversation",
        user,
        key: createKey(),
      });
    },
    [createKey],
  );

  const closePanel = useCallback(() => {
    setPanel(null);
  }, []);

  const toggleList = useCallback(() => {
    setPanel((previous) =>
      previous
        ? null
        : {
            mode: "list",
            key: createKey(),
          },
    );
  }, [createKey]);

  const isOpen = status === "authenticated" && panel !== null;

  const value = useMemo<MessagePanelContextValue>(
    () => ({
      isOpen,
      openList,
      openConversation,
      closePanel,
      toggleList,
    }),
    [isOpen, openList, openConversation, closePanel, toggleList],
  );

  return (
    <MessagePanelContext.Provider value={value}>
      {children}

      {status === "authenticated" && panel !== null && (
        <MessageModal
          key={panel.key}
          isOpen={true}
          onClose={closePanel}
          initialUser={panel.mode === "conversation" ? panel.user : null}
        />
      )}
    </MessagePanelContext.Provider>
  );
}

export default function MessagePanelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <MessagePanelState key={user ? `${user.role}:${user.id}` : "guest"}>
      {children}
    </MessagePanelState>
  );
}

export function useMessagePanel() {
  const context = useContext(MessagePanelContext);

  if (!context) {
    throw new Error("useMessagePanel은 MessagePanelProvider 내부에서 사용해야 합니다.");
  }

  return context;
}
