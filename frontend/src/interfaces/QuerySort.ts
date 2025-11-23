import { SortOrder } from "../types/SortOrder";

export interface QuerySort {
    sortField: string;
    sortOrder: SortOrder | null;
}