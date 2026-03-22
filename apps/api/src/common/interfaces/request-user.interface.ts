import { Role } from '../enums/role.enum';

export interface RequestUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}
