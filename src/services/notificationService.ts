export const notificationService = {
  requestPermission: async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('Trình duyệt không hỗ trợ thông báo');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  },

  showNotification: (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    }
  },

  scheduleReminder: (sessionDate: string, sessionTime: string, subjectName: string) => {
    const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
    const now = new Date();
    const reminderTime = new Date(sessionDateTime.getTime() - 30 * 60 * 1000);

    if (reminderTime > now) {
      const timeUntilReminder = reminderTime.getTime() - now.getTime();

      if (timeUntilReminder < 24 * 60 * 60 * 1000) {
        setTimeout(() => {
          notificationService.showNotification('Nhắc nhở học tập', {
            body: `Còn 30 phút nữa đến buổi học ${subjectName}`,
            tag: `session-${sessionDate}-${sessionTime}`,
          });
        }, timeUntilReminder);
      }
    }
  },

  checkUpcomingSessions: (sessions: any[]) => {
    const now = new Date();
    const upcomingSessions = sessions.filter((session) => {
      const sessionDateTime = new Date(`${session.session_date}T${session.start_time}`);
      const timeDiff = sessionDateTime.getTime() - now.getTime();
      return timeDiff > 0 && timeDiff <= 30 * 60 * 1000 && !session.is_completed;
    });

    return upcomingSessions;
  },

  checkUpcomingExams: (subjects: any[]) => {
    const now = new Date();
    const upcomingExams = subjects.filter((subject) => {
      const examDate = new Date(subject.exam_date);
      const daysDiff = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff > 0 && daysDiff <= 7;
    });

    return upcomingExams;
  },
};
