export interface StreamToolCall {
  id: string;
  name: string;
  args: string;
  result?: any;
}

export interface StreamMessage {
  id: string;
  type: 'human' | 'ai' | 'tool';
  content: string;
  toolContent?: StreamToolCall;
}

export interface StreamEvent {
  event: string;
  name: string;
  run_id: string;
  data: {
    run_id?: string;
    input?: any;
    output?: any;
    chunk?: {
      id?: string;
      content?: any;
      additional_kwargs?: Record<string, any>;
      generate?: {
        product_recommendations?: ProductRecommendations;
        menu_recommendations?: MenuRecommendations;
      };
    };
  };
}

export interface StreamStatus {
  content: string;
  name?: string;
}

export interface Item {
  name: string;
  price: string;
  description: string;
  reason: string;
  category: string;
  tags: string[];
}

export interface Product extends Item {
  sku: string;
  image_url: string;
  product_url: string;
  cart_url: string;
}

export interface MenuItem extends Item {
  icon: string;
}

export interface ProductRecommendations {
  recommendations: Array<Product>;
  query: string;
  // follow_up_questions: string[];
}

export interface MenuRecommendations {
  recommendations: Array<MenuItem>;
  query: string;
  // follow_up_questions: string[];
}
