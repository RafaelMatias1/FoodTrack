import bcrypt from 'bcryptjs';

export const hashSenha = (senha: string) => bcrypt.hash(senha, 10);
export const compararSenha = (senha: string, hash: string) => bcrypt.compare(senha, hash);
