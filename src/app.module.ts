import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MulterModule } from "@nestjs/platform-express/multer";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
// import { AttendanceModule } from "./attendance/attendance.module";
// import { HolidayModule } from "./holiday/holiday.module";
// import { ConfigurationModule } from "./configs/configuration.module";
// import { NotificationModule } from "./notification/notification.module";
// import { TemplateModule } from "./template/template.module";
// import { WorksheetModule } from "./worksheet/worksheet.module";
// import { QuestionModule } from "./Question/question.module";
// import { LessonPlanModule } from "./lessonPlan/lessonPlan.module";
// import { AdminFormModule } from "./adminForm/adminForm.module";
// import { LikeModule } from "./like/like.module";
// import { CommentModule } from "./comment/comment.module";
// import { TrackAssessmentModule } from "./trackAssessment/trackassessment.module";
// import { AssessmentSetModule } from "./assessmentset/assessmentset.module";
// import { InAppNotificationModule } from "./inAppNotification/inAppNotification.module";
// import { MentorTrackingModule } from "./mentorTracking/mentorTracking.module";
// import { MonitorTrackingModule } from "./monitorTracking/monitorTracking.module";
// import { CourseTrackingModule } from "./courseTracking/courseTracking.module";
// import { AnnouncementsModule } from "./announcements/announcements.module";
// import { RoleModule } from "./role/role.module";
// import { WorkHistoryModule } from "./workHistory/workHistory.module";
// import { StudentModule } from "./student/student.module";
// import { UserModule } from "./user/user.module";
import { CourseModule } from "./course/course.module";
import { SchoolModule } from "./school/school.module";
import { GroupModule } from "./group/group.module";
import { GroupMembershipModule } from "./groupMembership/groupMembership.module";
import { ProgramModule } from "./altProgram/altProgram.module";
import { ALTCourseTrackingModule } from "./altCourseTracking/altCourseTracking.module";
import { ALTLessonTrackingModule } from "./altLessonTracking/altLessonTracking.module";
import { ALTProgramAssociationModule } from "./altProgramAssociation/altProgramAssociation.module";
import { ALTModuleTrackingModule } from "./altModuleTracking/altModuleTracking.module";
import { ALTUserCourseEligibilityModule } from "./altUserEligibility/altUserEligibility.module";
import { ALTCurrentPhaseModule } from "./altCurrentPhase/altCurrentPhase.module";
import { ALTAssessmentExportModule } from "./altAssessmentExport/altAssessmentExport.module";
import { ALTTimeSpentExportModule } from "./altTimeSpentExport/altTimeSpentExport.module";
import { ALTStudentModule } from "./altStudent/altStudent.module";
import { ALTUserModule } from "./altUser/altUser.module";
import { ALTTeachertModule } from "./altTeacher/altTeacher.module";
import { ALTBulkUploadStudentModule } from "./altBulkUploadStudent/altBulkUploadStudent.module";
import { ALTBulkUploadTeacherModule } from "./altBulkUploadTeacher/altBulkUploadTeacher.module";
import { ALTBulkUploadSchoolModule } from "./altBulkUploadSchool/altBulkUploadSchool.module";
import { ALTAuthModule } from "./altAuth/altAuth.module";
@Module({
  imports: [
    ConfigModule.forRoot(),
    MulterModule.register({
      dest: "./uploads",
    }),
    /* RoleModule,
    AttendanceModule,
    HolidayModule,
    ConfigurationModule,
    TemplateModule,
    NotificationModule,
    WorksheetModule,
    QuestionModule,
    LessonPlanModule,
    AdminFormModule,
    LikeModule,
    CommentModule,
    TrackAssessmentModule,
    AssessmentSetModule,
    InAppNotificationModule,
    MentorTrackingModule,
    MonitorTrackingModule,
    CourseTrackingModule,
    AnnouncementsModule,
    WorkHistoryModule,
    StudentModule,
    UserModule,
    */
    CourseModule,
    SchoolModule,
    GroupModule,
    GroupMembershipModule,
    ProgramModule,
    ALTCourseTrackingModule,
    ALTLessonTrackingModule,
    ALTProgramAssociationModule,
    ALTModuleTrackingModule,
    ALTUserCourseEligibilityModule,
    ALTCurrentPhaseModule,
    ALTAssessmentExportModule,
    ALTTimeSpentExportModule,
    ALTStudentModule,
    ALTUserModule,
    ALTTeachertModule,
    ALTBulkUploadStudentModule,
    ALTBulkUploadTeacherModule,
    ALTBulkUploadSchoolModule,
    ALTAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
