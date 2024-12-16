export interface UserSetup {
  strategy_id: string;
  id: string;
  setup_name: string;
  setup_description?: string;
  tags: string[];
  created_at: string;
  risk_strategy?: string;
}

export interface RiskRewardStrategy {
  name: string;
  type: string;
  description: string;
  example: string;
  ratio?: number;
  additionalParams?: Record<string, number>;
}

export interface RiskStrategy {
  name: string;
  type: string;
  value: number;
  description: string;
  example: string;
  selected: boolean;
  additionalParams?: {
    [key: string]: number | string | boolean | { riskToReward: number; riskPercentage: number }[];
  };
}

