import { ProgramDto } from "src/selfAssessment/dto/program.dto";
import { FBMGStoProgramDto } from "src/selfAssessment/dto/fbmgstoProgram.dto";

export interface ISelfAssessServicelocator {
    createProgram(request: any, programDto: ProgramDto);
    getProgramById(request: any, programId: String);
    getProgramByFBMGS(request: any,fbmgstoprogramdto: FBMGStoProgramDto);
    // getProgramAppliedCourseList
}
