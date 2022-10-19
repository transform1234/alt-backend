export interface IServicelocator {
  getAllCourse(
    subject: [string],
    audience: [string],
    className: [string],
    medium: [string],
    limit: string,
    request: any
  );

  getCoursesByIds(courseIds: [string], request: any);
  getCourseDetail(courseId: string, request: any);
  getCourseHierarchy(courseId: string, type: string, request: any);
  getQuestionset(request: any);
  getQuestionsetContent(questionsetId: string, request: any);
}
