import { KycStatus } from "@prisma/client";

//Dados acessíveis por todos os usuários
export interface PublicUserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: Date;
}

export const PublicUserFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  createdAt: true,
};

//Dados acessíveis apenas pelo usuário logado
export interface PrivateUserModel {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  documentId: string;
  balanceCents: number;
  createdAt: Date;
}

export const PrivateUserFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  documentId: true,
  balanceCents: true,
  createdAt: true,
};

//Dados acessíveis apenas pelo sistema
export interface InternalUserModel {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  documentId: string;
  kycStatus: KycStatus;
  balanceCents: number;
  createdAt: Date;
}

export const InternalUserFields = {
  id: true,
  email: true,
  password: true,
  firstName: true,
  lastName: true,
  documentId: true,
  kycStatus: true,
  balanceCents: true,
  createdAt: true,
};
