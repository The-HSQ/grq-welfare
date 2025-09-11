export interface DashboardTotalCounts {
  inventory: number;
  donations: number;
  expenses: number;
  vehicles: number;
}

export interface DashboardFinancialSummary {
  total_donation_amount: number;
  total_expense_amount: number;
  net_balance: number;
  total_outstanding_balances_for_vendors: number;
}

export interface DashboardAdditionalStats {
  available_inventory_items: number;
  donated_vehicles: number;
  pending_expenses: number;
}

export interface DashboardData {
  total_counts: DashboardTotalCounts;
  financial_summary: DashboardFinancialSummary;
  additional_stats: DashboardAdditionalStats;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  message: string;
}
