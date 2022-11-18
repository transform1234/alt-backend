import { ProgramDto } from "src/altProgram/dto/program.dto";
import { BMGStoProgramDto } from "src/altProgram/dto/bmgstoProgram.dto";

export interface IProgramServicelocator {
  createProgram(request: any, programDto: ProgramDto);
  getProgramDetailsById(request: any, programId: String);
  getCurrentProgramId(request: any, fbmgstoprogramdto: BMGStoProgramDto);
}
