export interface StreamModel {
  id: string;
  type: 'stream';
  username: string;
  displayName?: string;
  isEditingName?: boolean;
  clockInTime: number | null;
  clockOutTime: number | null;
  notes?: string;
}

export interface GroupModel {
  id: string;
  type: 'group';
  name: string;
  color: string;
  items: StreamModel[];
  previewCols?: number;
  expandedCols?: number;
}

export type DashboardItem = StreamModel | GroupModel;

export interface AppState {
  models: DashboardItem[];
  isSetup: boolean;
  gridColumns: number;
}