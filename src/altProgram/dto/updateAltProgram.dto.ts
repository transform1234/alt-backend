import { PartialType } from "@nestjs/swagger";
import { ProgramDto } from "./program.dto";

export class UpdateALTProgramDto extends PartialType(ProgramDto) {
    constructor(obj: any) {
        super(obj);
        Object.assign(this, obj);
      }
}
