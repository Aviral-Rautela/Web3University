use candid::{CandidType, Decode, Encode};
use ic_cdk::api::caller;
use ic_cdk::{init, post_upgrade, pre_upgrade, query, update};
use ic_cdk::storage;
use std::cell::RefCell;
use std::collections::HashMap;
use ic_cdk::api::time;

type UserId = String;
type CourseId = String;
type QuizId = String;
type DiscussionId = String;

#[derive(CandidType, Clone, Debug)]
pub enum UserRole {
    Student,
    Teacher,
}

#[derive(CandidType, Clone, Debug)]
pub struct User {
    pub id: UserId,
    pub name: String,
    pub role: UserRole,
    pub bio: String,
    pub profile_photo: String,
    pub created_at: u64,
}

#[derive(CandidType, Clone, Debug)]
pub struct Course {
    pub id: CourseId,
    pub title: String,
    pub description: String,
    pub instructor_id: UserId,
    pub instructor_name: String,
    pub lessons: Vec<Lesson>,
    pub created_at: u64,
    pub updated_at: u64,
}

#[derive(CandidType, Clone, Debug)]
pub struct Lesson {
    pub id: String,
    pub title: String,
    pub content: String,
    pub video_url: Option<String>,
    pub quiz_id: Option<QuizId>,
    pub order: u32,
}

#[derive(CandidType, Clone, Debug)]
pub struct Quiz {
    pub id: QuizId,
    pub course_id: CourseId,
    pub lesson_id: String,
    pub title: String,
    pub questions: Vec<Question>,
    pub passing_score: u32,
    pub created_at: u64,
}

#[derive(CandidType, Clone, Debug)]
pub struct Question {
    pub id: String,
    pub question: String,
    pub options: Vec<String>,
    pub correct_answer: u32,
    pub points: u32,
}

#[derive(CandidType, Clone, Debug)]
pub struct Enrollment {
    pub student_id: UserId,
    pub course_id: CourseId,
    pub enrolled_at: u64,
    pub completed_lessons: Vec<String>,
    pub progress_percentage: u32,
    pub completed: bool,
    pub certificate_issued: bool,
}

#[derive(CandidType, Clone, Debug)]
pub struct QuizAttempt {
    pub student_id: UserId,
    pub quiz_id: QuizId,
    pub answers: Vec<u32>,
    pub score: u32,
    pub passed: bool,
    pub attempted_at: u64,
}

#[derive(CandidType, Clone, Debug)]
pub struct Discussion {
    pub id: DiscussionId,
    pub course_id: CourseId,
    pub author_id: UserId,
    pub author_name: String,
    pub title: String,
    pub content: String,
    pub replies: Vec<Reply>,
    pub created_at: u64,
}

#[derive(CandidType, Clone, Debug)]
pub struct Reply {
    pub id: String,
    pub author_id: UserId,
    pub author_name: String,
    pub content: String,
    pub created_at: u64,
}

#[derive(CandidType, Clone, Debug)]
pub struct Certificate {
    pub student_id: UserId,
    pub course_id: CourseId,
    pub course_title: String,
    pub student_name: String,
    pub instructor_name: String,
    pub issued_at: u64,
    pub certificate_hash: String,
}

// Storage
thread_local! {
    static USERS: RefCell<HashMap<UserId, User>> = RefCell::new(HashMap::new());
    static COURSES: RefCell<HashMap<CourseId, Course>> = RefCell::new(HashMap::new());
    static QUIZZES: RefCell<HashMap<QuizId, Quiz>> = RefCell::new(HashMap::new());
    static ENROLLMENTS: RefCell<HashMap<String, Enrollment>> = RefCell::new(HashMap::new());
    static QUIZ_ATTEMPTS: RefCell<Vec<QuizAttempt>> = RefCell::new(Vec::new());
    static DISCUSSIONS: RefCell<HashMap<DiscussionId, Discussion>> = RefCell::new(HashMap::new());
    static CERTIFICATES: RefCell<Vec<Certificate>> = RefCell::new(Vec::new());
}

// Helper functions
fn get_user_id() -> UserId {
    caller().to_string()
}

fn generate_id() -> String {
    format!("{}-{}", time(), ic_cdk::api::instruction_counter())
}

fn generate_hash(data: &str) -> String {
    format!("hash_{}", data.len())
}

// User management
#[update]
pub fn create_user(name: String, role: UserRole, bio: String, profile_photo: String) -> Result<User, String> {
    let user_id = get_user_id();
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        if users.contains_key(&user_id) {
            return Err("User already exists".to_string());
        }
        
        let user = User {
            id: user_id.clone(),
            name,
            role,
            bio,
            profile_photo,
            created_at: time(),
        };
        
        users.insert(user_id, user.clone());
        Ok(user)
    })
}

#[query]
pub fn get_user() -> Option<User> {
    let user_id = get_user_id();
    USERS.with(|users| users.borrow().get(&user_id).cloned())
}

#[update]
pub fn update_user_profile(name: String, bio: String, profile_photo: String) -> Result<User, String> {
    let user_id = get_user_id();
    
    USERS.with(|users| {
        let mut users = users.borrow_mut();
        
        match users.get_mut(&user_id) {
            Some(user) => {
                user.name = name;
                user.bio = bio;
                user.profile_photo = profile_photo;
                Ok(user.clone())
            }
            None => Err("User not found".to_string()),
        }
    })
}

// Course management
#[update]
pub fn create_course(title: String, description: String) -> Result<Course, String> {
    let user_id = get_user_id();
    
    // Check if user is a teacher
    let user = USERS.with(|users| users.borrow().get(&user_id).cloned());
    match user {
        Some(user) => {
            if !matches!(user.role, UserRole::Teacher) {
                return Err("Only teachers can create courses".to_string());
            }
            
            let course_id = generate_id();
            let course = Course {
                id: course_id.clone(),
                title,
                description,
                instructor_id: user_id,
                instructor_name: user.name,
                lessons: Vec::new(),
                created_at: time(),
                updated_at: time(),
            };
            
            COURSES.with(|courses| {
                courses.borrow_mut().insert(course_id, course.clone());
                Ok(course)
            })
        }
        None => Err("User not found".to_string()),
    }
}

#[query]
pub fn get_all_courses() -> Vec<Course> {
    COURSES.with(|courses| courses.borrow().values().cloned().collect())
}

#[query]
pub fn get_course(course_id: CourseId) -> Option<Course> {
    COURSES.with(|courses| courses.borrow().get(&course_id).cloned())
}

#[query]
pub fn search_courses(query: String) -> Vec<Course> {
    COURSES.with(|courses| {
        courses
            .borrow()
            .values()
            .filter(|course| {
                course.title.to_lowercase().contains(&query.to_lowercase()) ||
                course.description.to_lowercase().contains(&query.to_lowercase())
            })
            .cloned()
            .collect()
    })
}

#[update]
pub fn add_lesson_to_course(course_id: CourseId, title: String, content: String, video_url: Option<String>, order: u32) -> Result<(), String> {
    let user_id = get_user_id();
    
    COURSES.with(|courses| {
        let mut courses = courses.borrow_mut();
        
        match courses.get_mut(&course_id) {
            Some(course) => {
                if course.instructor_id != user_id {
                    return Err("Only the instructor can add lessons".to_string());
                }
                
                let lesson = Lesson {
                    id: generate_id(),
                    title,
                    content,
                    video_url,
                    quiz_id: None,
                    order,
                };
                
                course.lessons.push(lesson);
                course.lessons.sort_by(|a, b| a.order.cmp(&b.order));
                course.updated_at = time();
                
                Ok(())
            }
            None => Err("Course not found".to_string()),
        }
    })
}

// Enrollment management
#[update]
pub fn enroll_in_course(course_id: CourseId) -> Result<Enrollment, String> {
    let user_id = get_user_id();
    
    // Check if user is a student
    let user = USERS.with(|users| users.borrow().get(&user_id).cloned());
    match user {
        Some(user) => {
            if !matches!(user.role, UserRole::Student) {
                return Err("Only students can enroll in courses".to_string());
            }
        }
        None => return Err("User not found".to_string()),
    }
    
    let enrollment_key = format!("{}_{}", user_id, course_id);
    
    ENROLLMENTS.with(|enrollments| {
        let mut enrollments = enrollments.borrow_mut();
        
        if enrollments.contains_key(&enrollment_key) {
            return Err("Already enrolled in this course".to_string());
        }
        
        let enrollment = Enrollment {
            student_id: user_id,
            course_id,
            enrolled_at: time(),
            completed_lessons: Vec::new(),
            progress_percentage: 0,
            completed: false,
            certificate_issued: false,
        };
        
        enrollments.insert(enrollment_key, enrollment.clone());
        Ok(enrollment)
    })
}

#[query]
pub fn get_student_enrollments() -> Vec<Enrollment> {
    let user_id = get_user_id();
    
    ENROLLMENTS.with(|enrollments| {
        enrollments
            .borrow()
            .values()
            .filter(|enrollment| enrollment.student_id == user_id)
            .cloned()
            .collect()
    })
}

#[update]
pub fn mark_lesson_completed(course_id: CourseId, lesson_id: String) -> Result<(), String> {
    let user_id = get_user_id();
    let enrollment_key = format!("{}_{}", user_id, course_id);
    
    ENROLLMENTS.with(|enrollments| {
        let mut enrollments = enrollments.borrow_mut();
        
        match enrollments.get_mut(&enrollment_key) {
            Some(enrollment) => {
                if !enrollment.completed_lessons.contains(&lesson_id) {
                    enrollment.completed_lessons.push(lesson_id);
                    
                    // Update progress
                    let course = COURSES.with(|courses| courses.borrow().get(&course_id).cloned());
                    if let Some(course) = course {
                        let total_lessons = course.lessons.len() as u32;
                        let completed_lessons = enrollment.completed_lessons.len() as u32;
                        enrollment.progress_percentage = (completed_lessons * 100) / total_lessons;
                        
                        if completed_lessons == total_lessons {
                            enrollment.completed = true;
                        }
                    }
                }
                Ok(())
            }
            None => Err("Enrollment not found".to_string()),
        }
    })
}

// Quiz management
#[update]
pub fn create_quiz(course_id: CourseId, lesson_id: String, title: String, questions: Vec<Question>, passing_score: u32) -> Result<Quiz, String> {
    let user_id = get_user_id();
    
    // Check if user is the instructor of the course
    let course = COURSES.with(|courses| courses.borrow().get(&course_id).cloned());
    match course {
        Some(course) => {
            if course.instructor_id != user_id {
                return Err("Only the instructor can create quizzes".to_string());
            }
        }
        None => return Err("Course not found".to_string()),
    }
    
    let quiz_id = generate_id();
    let quiz = Quiz {
        id: quiz_id.clone(),
        course_id,
        lesson_id: lesson_id.clone(),
        title,
        questions,
        passing_score,
        created_at: time(),
    };
    
    QUIZZES.with(|quizzes| {
        quizzes.borrow_mut().insert(quiz_id.clone(), quiz.clone());
    });
    
    // Update lesson to include quiz
    COURSES.with(|courses| {
        let mut courses = courses.borrow_mut();
        if let Some(course) = courses.get_mut(&course_id) {
            if let Some(lesson) = course.lessons.iter_mut().find(|l| l.id == lesson_id) {
                lesson.quiz_id = Some(quiz_id);
            }
        }
    });
    
    Ok(quiz)
}

#[query]
pub fn get_quiz(quiz_id: QuizId) -> Option<Quiz> {
    QUIZZES.with(|quizzes| quizzes.borrow().get(&quiz_id).cloned())
}

#[update]
pub fn attempt_quiz(quiz_id: QuizId, answers: Vec<u32>) -> Result<QuizAttempt, String> {
    let user_id = get_user_id();
    
    let quiz = QUIZZES.with(|quizzes| quizzes.borrow().get(&quiz_id).cloned());
    match quiz {
        Some(quiz) => {
            if answers.len() != quiz.questions.len() {
                return Err("Number of answers doesn't match number of questions".to_string());
            }
            
            let mut score = 0;
            let mut total_points = 0;
            
            for (i, question) in quiz.questions.iter().enumerate() {
                total_points += question.points;
                if answers[i] == question.correct_answer {
                    score += question.points;
                }
            }
            
            let passed = score >= quiz.passing_score;
            
            let attempt = QuizAttempt {
                student_id: user_id,
                quiz_id,
                answers,
                score,
                passed,
                attempted_at: time(),
            };
            
            QUIZ_ATTEMPTS.with(|attempts| {
                attempts.borrow_mut().push(attempt.clone());
            });
            
            Ok(attempt)
        }
        None => Err("Quiz not found".to_string()),
    }
}

// Discussion management
#[update]
pub fn create_discussion(course_id: CourseId, title: String, content: String) -> Result<Discussion, String> {
    let user_id = get_user_id();
    
    let user = USERS.with(|users| users.borrow().get(&user_id).cloned());
    match user {
        Some(user) => {
            let discussion_id = generate_id();
            let discussion = Discussion {
                id: discussion_id.clone(),
                course_id,
                author_id: user_id,
                author_name: user.name,
                title,
                content,
                replies: Vec::new(),
                created_at: time(),
            };
            
            DISCUSSIONS.with(|discussions| {
                discussions.borrow_mut().insert(discussion_id, discussion.clone());
            });
            
            Ok(discussion)
        }
        None => Err("User not found".to_string()),
    }
}

#[query]
pub fn get_course_discussions(course_id: CourseId) -> Vec<Discussion> {
    DISCUSSIONS.with(|discussions| {
        discussions
            .borrow()
            .values()
            .filter(|discussion| discussion.course_id == course_id)
            .cloned()
            .collect()
    })
}

#[update]
pub fn reply_to_discussion(discussion_id: DiscussionId, content: String) -> Result<(), String> {
    let user_id = get_user_id();
    
    let user = USERS.with(|users| users.borrow().get(&user_id).cloned());
    match user {
        Some(user) => {
            DISCUSSIONS.with(|discussions| {
                let mut discussions = discussions.borrow_mut();
                
                match discussions.get_mut(&discussion_id) {
                    Some(discussion) => {
                        let reply = Reply {
                            id: generate_id(),
                            author_id: user_id,
                            author_name: user.name,
                            content,
                            created_at: time(),
                        };
                        
                        discussion.replies.push(reply);
                        Ok(())
                    }
                    None => Err("Discussion not found".to_string()),
                }
            })
        }
        None => Err("User not found".to_string()),
    }
}

// Certificate management
#[update]
pub fn issue_certificate(course_id: CourseId) -> Result<Certificate, String> {
    let user_id = get_user_id();
    let enrollment_key = format!("{}_{}", user_id, course_id);
    
    // Check if student completed the course
    let enrollment = ENROLLMENTS.with(|enrollments| {
        enrollments.borrow().get(&enrollment_key).cloned()
    });
    
    match enrollment {
        Some(enrollment) => {
            if !enrollment.completed {
                return Err("Course not completed".to_string());
            }
            
            if enrollment.certificate_issued {
                return Err("Certificate already issued".to_string());
            }
            
            let user = USERS.with(|users| users.borrow().get(&user_id).cloned());
            let course = COURSES.with(|courses| courses.borrow().get(&course_id).cloned());
            
            match (user, course) {
                (Some(user), Some(course)) => {
                    let certificate_data = format!("{}_{}_{}_{}", user.name, course.title, course.instructor_name, time());
                    let certificate_hash = generate_hash(&certificate_data);
                    
                    let certificate = Certificate {
                        student_id: user_id,
                        course_id,
                        course_title: course.title,
                        student_name: user.name,
                        instructor_name: course.instructor_name,
                        issued_at: time(),
                        certificate_hash,
                    };
                    
                    CERTIFICATES.with(|certificates| {
                        certificates.borrow_mut().push(certificate.clone());
                    });
                    
                    // Mark certificate as issued
                    ENROLLMENTS.with(|enrollments| {
                        let mut enrollments = enrollments.borrow_mut();
                        if let Some(enrollment) = enrollments.get_mut(&enrollment_key) {
                            enrollment.certificate_issued = true;
                        }
                    });
                    
                    Ok(certificate)
                }
                _ => Err("User or course not found".to_string()),
            }
        }
        None => Err("Enrollment not found".to_string()),
    }
}

#[query]
pub fn get_student_certificates() -> Vec<Certificate> {
    let user_id = get_user_id();
    
    CERTIFICATES.with(|certificates| {
        certificates
            .borrow()
            .iter()
            .filter(|cert| cert.student_id == user_id)
            .cloned()
            .collect()
    })
}

#[query]
pub fn verify_certificate(certificate_hash: String) -> Option<Certificate> {
    CERTIFICATES.with(|certificates| {
        certificates
            .borrow()
            .iter()
            .find(|cert| cert.certificate_hash == certificate_hash)
            .cloned()
    })
}

// Export candid interface
ic_cdk::export_candid!();