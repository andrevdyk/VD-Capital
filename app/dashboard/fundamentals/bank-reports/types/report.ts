export type Report = {
  id: string;
  title: string;
  publisher: string;
  author?: string;
  published_date: string;
  created_at: string;
  ai_summary: string;
  pdf_url: string;
  source_url: string;
  asset_class: string;
}