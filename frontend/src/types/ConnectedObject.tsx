export type EntityType = 'tickets' | 'persons' | 'venues' | 'coordinates' | 'events' | 'locations' | 'import_history';

export interface EntityData {
  id: number;
  title: string;
  description: string;
  type: EntityType;
  data: Record<string, any>;
}