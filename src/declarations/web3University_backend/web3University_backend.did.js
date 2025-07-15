export const idlFactory = ({ IDL }) => {
  const Result_7 = IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text });
  const QuizAttempt = IDL.Record({
    'attempted_at' : IDL.Nat64,
    'answers' : IDL.Vec(IDL.Nat32),
    'student_id' : IDL.Text,
    'score' : IDL.Nat32,
    'quiz_id' : IDL.Text,
    'passed' : IDL.Bool,
  });
  const Result_4 = IDL.Variant({ 'Ok' : QuizAttempt, 'Err' : IDL.Text });
  const Lesson = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'order' : IDL.Nat32,
    'video_url' : IDL.Opt(IDL.Text),
    'quiz_id' : IDL.Opt(IDL.Text),
  });
  const Course = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'updated_at' : IDL.Nat64,
    'instructor_name' : IDL.Text,
    'description' : IDL.Text,
    'created_at' : IDL.Nat64,
    'lessons' : IDL.Vec(Lesson),
    'instructor_id' : IDL.Text,
  });
  const Result_1 = IDL.Variant({ 'Ok' : Course, 'Err' : IDL.Text });
  const Reply = IDL.Record({
    'id' : IDL.Text,
    'content' : IDL.Text,
    'author_name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'author_id' : IDL.Text,
  });
  const Discussion = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'author_name' : IDL.Text,
    'created_at' : IDL.Nat64,
    'course_id' : IDL.Text,
    'replies' : IDL.Vec(Reply),
    'author_id' : IDL.Text,
  });
  const Result_5 = IDL.Variant({ 'Ok' : Discussion, 'Err' : IDL.Text });
  const Question = IDL.Record({
    'id' : IDL.Text,
    'question' : IDL.Text,
    'correct_answer' : IDL.Nat32,
    'options' : IDL.Vec(IDL.Text),
    'points' : IDL.Nat32,
  });
  const Quiz = IDL.Record({
    'id' : IDL.Text,
    'title' : IDL.Text,
    'created_at' : IDL.Nat64,
    'lesson_id' : IDL.Text,
    'course_id' : IDL.Text,
    'questions' : IDL.Vec(Question),
    'passing_score' : IDL.Nat32,
  });
  const Result_3 = IDL.Variant({ 'Ok' : Quiz, 'Err' : IDL.Text });
  const UserRole = IDL.Variant({ 'Teacher' : IDL.Null, 'Student' : IDL.Null });
  const User = IDL.Record({
    'id' : IDL.Text,
    'bio' : IDL.Text,
    'profile_photo' : IDL.Text,
    'name' : IDL.Text,
    'role' : UserRole,
    'created_at' : IDL.Nat64,
  });
  const Result = IDL.Variant({ 'Ok' : User, 'Err' : IDL.Text });
  const Enrollment = IDL.Record({
    'progress_percentage' : IDL.Nat32,
    'completed_lessons' : IDL.Vec(IDL.Text),
    'completed' : IDL.Bool,
    'enrolled_at' : IDL.Nat64,
    'certificate_issued' : IDL.Bool,
    'student_id' : IDL.Text,
    'course_id' : IDL.Text,
  });
  const Result_2 = IDL.Variant({ 'Ok' : Enrollment, 'Err' : IDL.Text });
  const Certificate = IDL.Record({
    'student_name' : IDL.Text,
    'issued_at' : IDL.Nat64,
    'instructor_name' : IDL.Text,
    'course_title' : IDL.Text,
    'student_id' : IDL.Text,
    'course_id' : IDL.Text,
    'certificate_hash' : IDL.Text,
  });
  const Result_6 = IDL.Variant({ 'Ok' : Certificate, 'Err' : IDL.Text });
  return IDL.Service({
    'add_lesson_to_course' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Opt(IDL.Text), IDL.Nat32],
        [Result_7],
        [],
      ),
    'attempt_quiz' : IDL.Func([IDL.Text, IDL.Vec(IDL.Nat32)], [Result_4], []),
    'create_course' : IDL.Func([IDL.Text, IDL.Text], [Result_1], []),
    'create_discussion' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result_5],
        [],
      ),
    'create_quiz' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Vec(Question), IDL.Nat32],
        [Result_3],
        [],
      ),
    'create_user' : IDL.Func(
        [IDL.Text, UserRole, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'enroll_in_course' : IDL.Func([IDL.Text], [Result_2], []),
    'get_all_courses' : IDL.Func([], [IDL.Vec(Course)], ['query']),
    'get_course' : IDL.Func([IDL.Text], [IDL.Opt(Course)], ['query']),
    'get_course_discussions' : IDL.Func(
        [IDL.Text],
        [IDL.Vec(Discussion)],
        ['query'],
      ),
    'get_quiz' : IDL.Func([IDL.Text], [IDL.Opt(Quiz)], ['query']),
    'get_student_certificates' : IDL.Func(
        [],
        [IDL.Vec(Certificate)],
        ['query'],
      ),
    'get_student_enrollments' : IDL.Func([], [IDL.Vec(Enrollment)], ['query']),
    'get_user' : IDL.Func([], [IDL.Opt(User)], ['query']),
    'issue_certificate' : IDL.Func([IDL.Text], [Result_6], []),
    'mark_lesson_completed' : IDL.Func([IDL.Text, IDL.Text], [Result_7], []),
    'reply_to_discussion' : IDL.Func([IDL.Text, IDL.Text], [Result_7], []),
    'search_courses' : IDL.Func([IDL.Text], [IDL.Vec(Course)], ['query']),
    'update_user_profile' : IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text],
        [Result],
        [],
      ),
    'verify_certificate' : IDL.Func(
        [IDL.Text],
        [IDL.Opt(Certificate)],
        ['query'],
      ),
  });
};
export const init = ({ IDL }) => { return []; };
