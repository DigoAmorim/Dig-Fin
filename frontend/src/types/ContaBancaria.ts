export interface ContaBancaria {
  id: string;
  name: string;
  bankInstitutionId: string;
  bankInstitutionName: string;
}

export interface ContaBancariaInput {
  name: string;
  bankInstitutionId: string;
}
