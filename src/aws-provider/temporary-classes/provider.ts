import { Provider as ProviderType } from '@tinystacks/ops-model';

abstract class Provider implements ProviderType {
  id?: string;
  type: string;

  constructor (id: string, type: string) {
    this.id = id;
    this.type = type;
  }
}

export default Provider;