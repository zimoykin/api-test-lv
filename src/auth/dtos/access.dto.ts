import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccessDto {
  @Expose()
  access_token: string;

  @Expose()
  refresh_token: string;
}
