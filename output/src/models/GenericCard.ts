import { IsNotEmpty, IsOptional, IsString, IsUrl } from '..';

export class GenericCard {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  key?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  subtitle?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
