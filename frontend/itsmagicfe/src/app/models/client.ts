export interface ClientViewModel {
  id: number;
  name: string;
  email: string;
}

export interface ClientCreateDTO {
  name: string;
  email: string;
}

export interface ClientUpdateDTO {
  name?: string;
  email?: string;
}
