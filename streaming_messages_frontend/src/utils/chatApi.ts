import { StreamMode } from "@/components/Settings";
import { StreamEvent, StreamMessage } from "@/lib/langgraph/types";
import { useClient } from "@/lib/langgraph/useClient";

const API_URL = 'http://localhost:8001';
const client = useClient({ url: API_URL });

const activeEntity = {
  id: '67432ccd724fe0cc3b97d04b',
  type: 'restaurant',
}

export const getThreadState = async (
  threadId: string
): Promise<Array<Record<string, any>>> => {
  const data = await fetch(`http://localhost:8001/threads/${threadId}`);
  const state = await data.json();
  console.log('state', state);

  return state;
};

export const updateState = async (
  threadId: string,
  fields: {
    newState: Record<string, any>;
    asNode?: string;
  }
) => {

  // return client.threads.updateState(threadId, {
  //   values: fields.newState,
  //   asNode: fields.asNode,
  // });
};

export const sendMessage = async (params: {
  threadId: string;
  messageId: string;
  message: string | null;
  model: string;
  userId: string;
  systemInstructions: string;
  streamMode: StreamMode;
}) => {

  const newHumanMessage: StreamMessage = {
      id: params.messageId,
      type: "human",
      content: params.message ?? '',
  }
    
  const stream: AsyncGenerator<StreamEvent> = client.streamEvents({
    messages: [newHumanMessage],
    user_id: params.userId,
    session_id: params.threadId,
    merchant_id: activeEntity.id,
    merchant_type: activeEntity.type,
  });

  return stream;
};

