export interface UserSetup {
  strategy_id: string;
  id: string;
  setup_name: string;
  setup_description?: string;
  tags: string[];
  created_at: string;
}

export interface RiskRewardStrategy {
  name: string;
  type: string;
  description: string;
  example: string;
  ratio?: number;
  additionalParams?: Record<string, number>;
}

