import { ProgramDto } from "src/selfAssessment/dto/program.dto";
import { FBMGStoProgramDto } from "src/selfAssessment/dto/fbmgstoProgram.dto";

export interface ISelfAssessServicelocator {
    createProgram(request: any, programDto: ProgramDto);
    getProgramDetailsById(request: any, programId: String);
    getCurrentProgramId(request: any,fbmgstoprogramdto: FBMGStoProgramDto);
}
