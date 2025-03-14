import type {
  StreamMessage,
  StreamToolCall,
  StreamStatus,
} from '../langgraph/types.ts';
import { useClient } from '../langgraph/useClient.ts';
import { useEventProcessor } from '../langgraph/useEventProcessor.ts';

const API_URL = 'http://localhost:8001';
const client = useClient({ url: API_URL });

const session = generateUUID();
const activeEntity = {
  id: '67432ccd724fe0cc3b97d04b',
  type: 'restaurant',
}

const createNewMessage = (
    type: 'human' | 'ai' | 'tool',
    content: string,
    toolContent?: StreamToolCall,
  ): StreamMessage => ({
    id: generateUUID(),
    type,
    content,
    ...(type === 'tool' && toolContent && { toolContent }),
  })

const onToken = (token: string) => {
    // console.log('onToken', token);
  }

const onStatus = (newStatus: StreamStatus) => {
  // console.log('onStatus', newStatus);
}

const onComplete = () => {
  // console.log('onComplete');
}

const onRecommendations = 
  (name: string, recommendations: any) => {
    // console.log('onRecommendations', name, recommendations);
}

const { processEvents } = useEventProcessor({
  client,
  sessionState: {
    userId: '', // TODO: get from session
    sessionId: session,
    activeEntity: activeEntity,
  },
  onToken,
  onStatus,
  onComplete,
  onRecommendations,
});

const handleSubmit = async (input: string) => {
  console.log('handleSubmit');

  if (!activeEntity?.id) {
    console.error('No active entity set. Access path forbidden.');
    return;
  }

  const newHumanMessage = createNewMessage('human', input.trim());


  await processEvents([newHumanMessage]);
}

handleSubmit("Hello")


function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
