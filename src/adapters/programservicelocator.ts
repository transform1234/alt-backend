import { ProgramDto } from "src/Program/dto/program.dto";
import { FBMGStoProgramDto } from "src/Program/dto/fbmgstoProgram.dto";

export interface IProgramServicelocator {
  createProgram(request: any, programDto: ProgramDto);
  getProgramDetailsById(request: any, programId: String);
  getCurrentProgramId(request: any, fbmgstoprogramdto: FBMGStoProgramDto);
}
