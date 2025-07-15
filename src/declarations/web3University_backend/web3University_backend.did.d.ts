import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Certificate {
  'student_name' : string,
  'issued_at' : bigint,
  'instructor_name' : string,
  'course_title' : string,
  'student_id' : string,
  'course_id' : string,
  'certificate_hash' : string,
}
export interface Course {
  'id' : string,
  'title' : string,
  'updated_at' : bigint,
  'instructor_name' : string,
  'description' : string,
  'created_at' : bigint,
  'lessons' : Array<Lesson>,
  'instructor_id' : string,
}
export interface Discussion {
  'id' : string,
  'title' : string,
  'content' : string,
  'author_name' : string,
  'created_at' : bigint,
  'course_id' : string,
  'replies' : Array<Reply>,
  'author_id' : string,
}
export interface Enrollment {
  'progress_percentage' : number,
  'completed_lessons' : Array<string>,
  'completed' : boolean,
  'enrolled_at' : bigint,
  'certificate_issued' : boolean,
  'student_id' : string,
  'course_id' : string,
}
export interface Lesson {
  'id' : string,
  'title' : string,
  'content' : string,
  'order' : number,
  'video_url' : [] | [string],
  'quiz_id' : [] | [string],
}
export interface Question {
  'id' : string,
  'question' : string,
  'correct_answer' : number,
  'options' : Array<string>,
  'points' : number,
}
export interface Quiz {
  'id' : string,
  'title' : string,
  'created_at' : bigint,
  'lesson_id' : string,
  'course_id' : string,
  'questions' : Array<Question>,
  'passing_score' : number,
}
export interface QuizAttempt {
  'attempted_at' : bigint,
  'answers' : Uint32Array | number[],
  'student_id' : string,
  'score' : number,
  'quiz_id' : string,
  'passed' : boolean,
}
export interface Reply {
  'id' : string,
  'content' : string,
  'author_name' : string,
  'created_at' : bigint,
  'author_id' : string,
}
export type Result = { 'Ok' : User } |
  { 'Err' : string };
export type Result_1 = { 'Ok' : Course } |
  { 'Err' : string };
export type Result_2 = { 'Ok' : Enrollment } |
  { 'Err' : string };
export type Result_3 = { 'Ok' : Quiz } |
  { 'Err' : string };
export type Result_4 = { 'Ok' : QuizAttempt } |
  { 'Err' : string };
export type Result_5 = { 'Ok' : Discussion } |
  { 'Err' : string };
export type Result_6 = { 'Ok' : Certificate } |
  { 'Err' : string };
export type Result_7 = { 'Ok' : null } |
  { 'Err' : string };
export interface User {
  'id' : string,
  'bio' : string,
  'profile_photo' : string,
  'name' : string,
  'role' : UserRole,
  'created_at' : bigint,
}
export type UserRole = { 'Teacher' : null } |
  { 'Student' : null };
export interface _SERVICE {
  'add_lesson_to_course' : ActorMethod<
    [string, string, string, [] | [string], number],
    Result_7
  >,
  'attempt_quiz' : ActorMethod<[string, Uint32Array | number[]], Result_4>,
  'create_course' : ActorMethod<[string, string], Result_1>,
  'create_discussion' : ActorMethod<[string, string, string], Result_5>,
  'create_quiz' : ActorMethod<
    [string, string, string, Array<Question>, number],
    Result_3
  >,
  'create_user' : ActorMethod<[string, UserRole, string, string], Result>,
  'enroll_in_course' : ActorMethod<[string], Result_2>,
  'get_all_courses' : ActorMethod<[], Array<Course>>,
  'get_course' : ActorMethod<[string], [] | [Course]>,
  'get_course_discussions' : ActorMethod<[string], Array<Discussion>>,
  'get_quiz' : ActorMethod<[string], [] | [Quiz]>,
  'get_student_certificates' : ActorMethod<[], Array<Certificate>>,
  'get_student_enrollments' : ActorMethod<[], Array<Enrollment>>,
  'get_user' : ActorMethod<[], [] | [User]>,
  'issue_certificate' : ActorMethod<[string], Result_6>,
  'mark_lesson_completed' : ActorMethod<[string, string], Result_7>,
  'reply_to_discussion' : ActorMethod<[string, string], Result_7>,
  'search_courses' : ActorMethod<[string], Array<Course>>,
  'update_user_profile' : ActorMethod<[string, string, string], Result>,
  'verify_certificate' : ActorMethod<[string], [] | [Certificate]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
