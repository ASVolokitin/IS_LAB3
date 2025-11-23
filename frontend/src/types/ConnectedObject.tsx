export type EntityType = 'tickets' | 'persons' | 'venues' | 'coordinates' | 'events' | 'locations';

export interface EntityData {
  id: number;
  title: string;
  description: string;
  type: EntityType;
  data: Record<string, any>;
}