"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageList from "./MessageList";
import InputArea from "./InputArea";
import HomeComponent from "./HomeComponent";
import Settings, { StreamMode } from "./Settings";
import { Message, Model } from "../types";
import { handleStreamEvent } from "../utils/streamHandler";
import {
  getThreadState,
  sendMessage,
} from "../utils/chatApi";
import { ASSISTANT_ID_COOKIE } from "@/constants";
import { getCookie, setCookie } from "@/utils/cookies";
import { ThreadState } from "@langchain/langgraph-sdk";
import { GraphInterrupt } from "./Interrupted";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [model, setModel] = useState<Model>("gpt-4o-mini" as Model);
  const [streamMode, setStreamMode] = useState<StreamMode>("messages");
  const [userId, setUserId] = useState<string>("");
  const [systemInstructions, setSystemInstructions] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadState, setThreadState] =
    useState<ThreadState<Record<string, any>>>();
  const [graphInterrupted, setGraphInterrupted] = useState(false);
  const [allowNullMessage, setAllowNullMessage] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeChat = async () => {
      const thread_id = uuidv4();
      setThreadId(thread_id);
      setUserId(uuidv4());
    };

    initializeChat();
  }, []);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (message: string | null) => {
    const messageId = uuidv4();
    if (message !== null) {
      setMessages([
        ...messages,
        { text: message, sender: "user", id: messageId },
      ]);
    }

    if (!threadId) {
      console.error("Thread ID is not available");
      return;
    }

    try {
      setIsLoading(true);
      setThreadState(undefined);
      setGraphInterrupted(false);
      setAllowNullMessage(false);

      if (!message) {
        console.error('No message provided');
        return;
      }

      const stream = await sendMessage({
        threadId,
        message,
        messageId,
        model,
        userId,
        systemInstructions,
        streamMode,
      });


      for await (const event of stream) {
        const eventType = String(event.event);
  
        // const handler = eventHandlers[eventType];
        // if (handler) {
        //   handler(event);
        // }

        handleStreamEvent(event, setMessages, streamMode);
      }

      // Fetch the current state of the thread
      // const currentState = await getThreadState(threadId);

      // console.dir(
      //   currentState,
      //   { depth: 3 }
      // );

      // setThreadState(currentState);
      // if (currentState.next.length) {
      //   setGraphInterrupted(true);
      // }

      setIsLoading(false);
    } catch (error) {
      console.error("Error streaming messages:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#212121] overflow-hidden rounded-lg shadow-md">
      <Settings
        onModelChange={setModel}
        onSystemInstructionsChange={setSystemInstructions}
        currentModel={model as any}
        currentSystemInstructions={systemInstructions}
        onStreamModeChange={setStreamMode}
        currentStreamMode={streamMode}
      />
      {messages.length === 0 ? (
        <HomeComponent onMessageSelect={handleSendMessage} />
      ) : (
        <div ref={messageListRef} className="overflow-y-auto h-screen">
          <MessageList messages={messages} />
          {!!graphInterrupted && !!threadState && !!threadId ? (
            <div className="flex items-center justify-start w-2/3 mx-auto">
              <GraphInterrupt
                setAllowNullMessage={setAllowNullMessage}
                threadId={threadId}
                state={threadState}
              />
            </div>
          ) : null}
          {allowNullMessage && (
            <div className="flex flex-col w-2/3 mx-auto overflow-y-scroll pb-[100px]">
              <button
                onClick={async () => handleSendMessage(null)}
                disabled={isLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2 max-w-[400px] mx-auto"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      )}
      <InputArea onSendMessage={handleSendMessage} />
    </div>
  );
}
