import { api, request } from './api-client.ts';

export class CrudService<
  Entity,
  CreateDto = Partial<Entity>,
  UpdateDto = Partial<Entity>,
  ListResponse = Entity[],
  CreateResponse = Entity,
  UpdateResponse = Entity,
> {
  protected readonly endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  list = (): Promise<ListResponse> => request(() => api.get<ListResponse>(this.endpoint));

  getById = (id: string | number): Promise<Entity> => (
    request(() => api.get<Entity>(`${this.endpoint}/${id}`))
  );

  create = (input: CreateDto): Promise<CreateResponse> => (
    request(() => api.post<CreateResponse>(this.endpoint, input))
  );

  update = (id: string | number, input: UpdateDto): Promise<UpdateResponse> => (
    request(() => api.put<UpdateResponse>(`${this.endpoint}/${id}`, input))
  );

  remove = (id: string | number): Promise<void> => (
    request(() => api.delete<void>(`${this.endpoint}/${id}`))
  );
}