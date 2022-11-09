import { ProgramDto } from "src/altProgram/dto/program.dto";
import { FBMGStoProgramDto } from "src/altProgram/dto/fbmgstoProgram.dto";

export interface IProgramServicelocator {
  createProgram(request: any, programDto: ProgramDto);
  getProgramDetailsById(request: any, programId: String);
  getCurrentProgramId(request: any, fbmgstoprogramdto: FBMGStoProgramDto);
}
