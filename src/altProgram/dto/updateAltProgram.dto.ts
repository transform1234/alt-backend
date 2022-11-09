import { PartialType } from '@nestjs/swagger';
import { ProgramDto } from './program.dto';

export class UpdateALTProgramDto extends PartialType(ProgramDto) {}