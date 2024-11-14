import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserOutputDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name: string;

  @Expose()
  role: string;

  @Exclude()
  passsword: string;

  @Expose()
  access_token: string;
}
