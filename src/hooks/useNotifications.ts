import { useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export function useNotifications(sessions: any[], subjects: any[]) {
  useEffect(() => {
    const initNotifications = async () => {
      const hasPermission = await notificationService.requestPermission();

      if (hasPermission) {
        const upcomingSessions = notificationService.checkUpcomingSessions(sessions);
        if (upcomingSessions.length > 0) {
          upcomingSessions.forEach((session) => {
            notificationService.scheduleReminder(
              session.session_date,
              session.start_time,
              session.subject_name || 'Môn học'
            );
          });
        }

        const upcomingExams = notificationService.checkUpcomingExams(subjects);
        if (upcomingExams.length > 0) {
          upcomingExams.forEach((subject) => {
            const examDate = new Date(subject.exam_date);
            const daysDiff = Math.ceil(
              (examDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            notificationService.showNotification('Cảnh báo kỳ thi', {
              body: `Còn ${daysDiff} ngày đến kỳ thi ${subject.name}`,
              tag: `exam-${subject.id}`,
            });
          });
        }
      }
    };

    if (sessions.length > 0 || subjects.length > 0) {
      initNotifications();
    }

    const interval = setInterval(() => {
      const upcomingSessions = notificationService.checkUpcomingSessions(sessions);
      upcomingSessions.forEach((session) => {
        notificationService.showNotification('Nhắc nhở học tập', {
          body: `Đến giờ học ${session.subject_name || 'môn học'}!`,
          tag: `session-now-${session.id}`,
        });
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [sessions, subjects]);
}
