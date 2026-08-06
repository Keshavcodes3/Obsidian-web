import { Types } from 'mongoose'
import { VaultSettings } from '../types/vault.types';
export interface createVaultDTO {
  workspaceId: Types.ObjectId,
  coverImage?: string,
  name: string,
  description?: string;

  icon?: string;
  slug?: string;
  color?: string;
  createdBy: Types.ObjectId;
  isDefault: boolean;

  settings: VaultSettings;
}