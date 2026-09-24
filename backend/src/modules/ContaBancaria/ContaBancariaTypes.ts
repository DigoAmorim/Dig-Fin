export interface ContaBancaria {
    id: string;
    name: string;
    bankInstitutionId: string;
    bankInstitutionName: string;
    pluggyAccountId: string | null;
    pluggyStatus: 'nao_sincronizada' | 'sincronizada';
}

export interface ContaBancariaInput {
    name: string;
    bankInstitutionId: string;
}
