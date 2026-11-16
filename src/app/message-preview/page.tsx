"use client";

import { useState } from "react";

import PageMain from "@/components/layout/Page/PageMain";
import PageContainer from "@/components/layout/Page/PageContainer";

import ConversationItem from "@/components/common/Message/ConversationItem/ConversationItem";

type PreviewView = "conversations" | "messages" | "empty";

export default function MessagePreviewPage() {
  const [view, setView] = useState<PreviewView>("conversations");

  return (
    <PageMain>
      <PageContainer>
        <div style={{ padding: "40px 0" }}>
          <h1>쪽지 UI 퍼블리싱 미리보기</h1>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              margin: "24px 0",
            }}
          >
            <button type="button" onClick={() => setView("conversations")}>
              대화방 목록
            </button>

            <button type="button" onClick={() => setView("messages")}>
              쪽지 목록
            </button>

            <button type="button" onClick={() => setView("empty")}>
              빈 대화방
            </button>
          </div>

          <div
            style={{
              width: "100%",
              maxWidth: 454,
              minHeight: 300,
              padding: 16,
              border: "1px solid #a7a984",
              borderRadius: 12,
            }}
          >
            {view === "conversations" && (
              <div>
                <ConversationItem
                  nickname="새싹이"
                  profileImageUrl={null}
                  hasUnreadMessage
                  onClick={() => window.alert("새싹이 대화방 클릭")}
                />

                <ConversationItem
                  nickname="초록정원"
                  profileImageUrl={null}
                  hasUnreadMessage={false}
                  onClick={() => window.alert("초록정원 대화방 클릭")}
                />

                <ConversationItem
                  nickname="잎사귀"
                  profileImageUrl={null}
                  hasUnreadMessage
                  onClick={() => window.alert("잎사귀 대화방 클릭")}
                />
              </div>
            )}

            {view === "messages" && <p>MessageList 컴포넌트 연결 예정</p>}

            {view === "empty" && <p>빈 대화방 UI 연결 예정</p>}
          </div>
        </div>
      </PageContainer>
    </PageMain>
  );
}
