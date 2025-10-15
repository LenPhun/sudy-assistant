import { Subject } from './supabase';

export interface ScheduleSession {
  subject_id: string;
  subject_name: string;
  session_date: string;
  start_time: string;
  end_time: string;
  chapter_topic: string;
}

export interface ScheduleSummary {
  total_sessions: number;
  subjects_breakdown: Record<string, number>;
  recommendations: string[];
}

export interface ScheduleResult {
  schedule: ScheduleSession[];
  summary: ScheduleSummary;
}

export interface UserPreferences {
  available_days: number[];
  session_duration_minutes: number;
  preferred_start_time: string;
  preferred_end_time?: string;
  break_duration_minutes?: number;
}

/**
 * Generate a study schedule based on subjects and user preferences
 * This algorithm considers all factors mentioned in the README:
 * - Days remaining until exam
 * - Number of chapters to study
 * - User's available time
 * - Preferred time slots
 * - Study sessions per week for each subject
 */
export function generateMockSchedule(
  subjects: Subject[],
  preferences: UserPreferences
): ScheduleResult {
  const schedule: ScheduleSession[] = [];
  const today = new Date();
  const availableDays = preferences.available_days;
  const sessionDuration = preferences.session_duration_minutes;
  const startTime = preferences.preferred_start_time;
  const endTime = preferences.preferred_end_time;

  subjects.forEach((subject: Subject) => {
    const examDate = new Date(subject.exam_date);

    // Factor 1: Calculate days remaining until exam
    const daysUntilExam = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Factor 2: Count available study days (user's available time)
    let availableStudyDays = 0;
    let currentDate = new Date(today);
    while (currentDate <= examDate) {
      const dayOfWeek = currentDate.getDay();
      if (availableDays.includes(dayOfWeek === 0 ? 0 : dayOfWeek)) {
        availableStudyDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Factor 3: Calculate total sessions based on chapters and study frequency
    // Ensure minimum 2 sessions per chapter, but respect study_days_per_week
    const minSessionsPerChapter = 2;
    const sessionsPerWeek = subject.study_days_per_week;

    // Calculate maximum sessions based on available days and study frequency
    const weeksUntilExam = Math.ceil(daysUntilExam / 7);
    const maxSessionsByFrequency = weeksUntilExam * sessionsPerWeek;
    const maxSessionsByChapters = subject.chapters_count * minSessionsPerChapter;

    // Total sessions is limited by both available days and subject constraints
    const totalSessions = Math.min(
      availableStudyDays,
      maxSessionsByFrequency,
      maxSessionsByChapters
    );

    // Tạo danh sách tất cả các ngày hợp lệ từ hôm nay đến ngày trước ngày thi
    let validDates: Date[] = [];
    let tempDate = new Date(today);
    tempDate.setHours(0,0,0,0); // Đảm bảo so sánh đúng ngày
    const examDateOnly = new Date(examDate.toISOString().split('T')[0]);
    examDateOnly.setHours(0,0,0,0);
    while (tempDate < examDateOnly) { // chỉ lấy ngày trước ngày thi
      const dayOfWeek = tempDate.getDay();
      if (availableDays.includes(dayOfWeek === 0 ? 0 : dayOfWeek)) {
        validDates.push(new Date(tempDate));
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }
    // Hàm xáo trộn chuẩn cho mảng
    function shuffle(array: Date[]) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    validDates = shuffle(validDates);

    // Phân chương cho từng buổi học như trước
    const chapters = Array.from({ length: subject.chapters_count }, (_, i) => i + 1);
    const sessionsCount = Math.min(totalSessions, validDates.length);
    const chaptersPerSession = Math.ceil(subject.chapters_count / sessionsCount);
    let chapterQueue = [...chapters];
    for (let sessionIndex = 0; sessionIndex < sessionsCount && chapterQueue.length > 0; sessionIndex++) {
      const currentDate = validDates[sessionIndex];
      currentDate.setHours(0,0,0,0); // Đảm bảo ngày đúng, tránh lệch múi giờ
      let start_time_str = '';
      let end_time_str = '';
      if (startTime) {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const start = new Date(currentDate);
        start.setHours(startHour, startMinute, 0, 0);
        const end = new Date(start.getTime() + sessionDuration * 60000);
        start_time_str = start.toTimeString().split(' ')[0].substring(0, 5);
        end_time_str = end.toTimeString().split(' ')[0].substring(0, 5);
      }
      // Lấy các chương cho buổi này
      const chaptersForSession = chapterQueue.splice(0, Math.ceil(subject.chapters_count / sessionsCount));
      schedule.push({
        subject_id: subject.id,
        subject_name: subject.name,
        session_date: currentDate.toISOString().split('T')[0],
        start_time: start_time_str,
        end_time: end_time_str,
        chapter_topic: `Ôn tập Chương ${chaptersForSession.join(', ')}`,
      });
    }
  });

  return {
    schedule,
    summary: {
      total_sessions: schedule.length,
      subjects_breakdown: subjects.reduce((acc: Record<string, number>, s) => {
        acc[s.name] = schedule.filter(sess => sess.subject_id === s.id).length;
        return acc;
      }, {}),
      recommendations: ['Ôn tập đều đặn mỗi ngày để đạt hiệu quả tốt nhất.'],
    },
  };
}
