export interface Section {
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  disabled?: boolean;
  items?: Array<{
    title?: string;
    description?: string;
    icon?: string;
    image?: {
      src: string;
      alt: string;
    };
  }>;
}
