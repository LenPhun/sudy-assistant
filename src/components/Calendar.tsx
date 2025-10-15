import { useEffect, useState } from 'react';
import { Subject, StudySession } from '../lib/supabase';
import { generateMockSchedule } from '../lib/mockScheduleGenerator';
import { studySessionService } from '../services/studySessionService';
import { preferencesService } from '../services/preferencesService';
import { profileService } from '../services/profileService';
import { ChevronLeft, ChevronRight, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import { EditSessionModal } from './EditSessionModal';

interface CalendarProps {
  subjects: Subject[];
  userId: string;
}

export function Calendar({ subjects, userId }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [currentDate, userId]);

  const loadSessions = async () => {
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      .toISOString()
      .split('T')[0];

    try {
      setLoading(true);
      const data = await studySessionService.getStudySessions(userId, startDate, endDate);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSchedule = async () => {
    if (subjects.length === 0) {
      alert('Vui lòng thêm môn học trước khi tạo lịch');
      return;
    }

    if (selectedSubjects.length === 0) {
      alert('Vui lòng chọn ít nhất một môn học để tạo lịch');
      return;
    }

    try {
      setGenerating(true);

      const preferences = await preferencesService.getPreferences(userId);
      const profile = await profileService.getProfile(userId);

      if (!preferences || !profile) {
        alert('Không thể tải thông tin người dùng');
        return;
      }

      // Filter subjects based on selection
      const subjectsToSchedule = subjects.filter(subject => selectedSubjects.includes(subject.id));

      // Skip AI API call and use mock data directly
      console.log('Using mock data for schedule generation');
      const mockResult = generateMockSchedule(subjectsToSchedule, preferences);

      if (mockResult.schedule.length === 0) {
        alert('Không thể tạo lịch học. Vui lòng thử lại.');
        return;
      }

      // Kiểm tra dữ liệu trước khi lưu
      if (!userId) {
        alert('Lỗi: Không tìm thấy userId. Vui lòng đăng nhập lại.');
        return;
      }

      // Lọc subject_id hợp lệ từ subjects hiện có để tránh lỗi foreign key
      const validSubjectIds = subjects.map(s => s.id);
      const validSchedule = mockResult.schedule.filter((s: any) => validSubjectIds.includes(s.subject_id));

      if (validSchedule.length === 0) {
        alert(`Lỗi: Không có subject_id hợp lệ trong lịch học. Vui lòng kiểm tra dữ liệu subjects và thử lại.`);
        return;
      }

      try {
        const newSessions = validSchedule.map((s: any) => ({
          user_id: userId,
          subject_id: s.subject_id,
          session_date: s.session_date,
          start_time: s.start_time,
          end_time: s.end_time,
          chapter_topic: s.chapter_topic,
          is_completed: false,
          notes: '',
        }));

        // Kiểm tra dữ liệu hợp lệ
        if (newSessions.some((session: any) => !session.subject_id || !session.session_date)) {
          alert('Lỗi dữ liệu lịch học không hợp lệ. Vui lòng thử lại.');
          return;
        }

        await studySessionService.createMultipleSessions(newSessions);
        await loadSessions();
        console.log('Đã lưu lịch vào database thành công');
        alert(`Đã tạo ${validSchedule.length} buổi học cho ${selectedSubjects.length} môn học!`);
      } catch (dbError: any) {
        console.error('Database error when saving mock data:', dbError);
        // Hiển thị lỗi chi tiết từ Supabase để dễ debug
        const errorMessage = dbError?.message || 'Không rõ lỗi';
        alert(`Đã tạo lịch học với ${validSchedule.length} buổi! ⚠️ Không thể lưu vào database. Lỗi: ${errorMessage}. Vui lòng kiểm tra kết nối Supabase hoặc cấu trúc bảng.`);
        console.log('Generated schedule:', validSchedule);
      }
    } catch (error: any) {
      console.error('Error generating schedule:', error);
      alert('Không thể tạo lịch học. Vui lòng thử lại.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeleteSession = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa buổi học này?')) return;
    try {
      await studySessionService.deleteStudySession(id);
      await loadSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      alert('Không thể xóa buổi học');
    }
  };

  const handleUpdateSession = async (id: string, updates: Partial<StudySession>) => {
    try {
      await studySessionService.updateStudySession(id, updates);
      await loadSessions();
      setEditingSession(null);
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Không thể cập nhật buổi học');
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getSessionsForDay = (day: Date) => {
    const dateStr = day.toISOString().split('T')[0];
    return sessions.filter((s) => s.session_date === dateStr);
  };

  const getSubjectById = (id: string) => {
    return subjects.find((s) => s.id === id);
  };

  const days = getDaysInMonth();

  const handleSubjectSelection = (subjectId: string, checked: boolean) => {
    if (checked) {
      setSelectedSubjects(prev => [...prev, subjectId]);
    } else {
      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
    }
  };

  const toggleSelectAllSubjects = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map(s => s.id));
    }
  };

  const toggleSubjectSelector = () => {
    setShowSubjectSelector(!showSubjectSelector);
    // Auto-select all subjects when opening selector if none selected
    if (!showSubjectSelector && selectedSubjects.length === 0) {
      setSelectedSubjects(subjects.map(s => s.id));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Tháng {currentDate.getMonth() + 1}/{currentDate.getFullYear()}
            </h2>
            <button
              onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={loadSessions}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </button>
            <button
              onClick={toggleSubjectSelector}
              disabled={subjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            >
              <Edit2 className="w-4 h-4" />
              Chọn môn ({selectedSubjects.length}/{subjects.length})
            </button>
            <button
              onClick={generateSchedule}
              disabled={generating || subjects.length === 0 || selectedSubjects.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
              {generating ? 'Đang tạo lịch...' : `Tạo lịch (${selectedSubjects.length} môn)`}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const daySessions = getSessionsForDay(day);
            const isToday = day.toDateString() === new Date().toDateString();

            return (
              <div
                key={day.toISOString()}
                className={`aspect-square border rounded-lg p-2 overflow-hidden transition-all hover:shadow-md ${
                  isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-24">
                  {daySessions.map((session) => {
                    const subject = getSubjectById(session.subject_id);
                    return (
                      <div
                        key={session.id}
                        className="group relative text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: subject?.color || '#3b82f6', color: 'white' }}
                        title={`${subject?.name}\n${session.start_time.slice(0, 5)} - ${session.end_time.slice(0, 5)}\n${session.chapter_topic}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate flex-1">{session.start_time.slice(0, 5)}</span>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setEditingSession(session)}
                              className="p-0.5 hover:bg-white/20 rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className="p-0.5 hover:bg-white/20 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          subjects={subjects}
          onClose={() => setEditingSession(null)}
          onUpdate={handleUpdateSession}
        />
      )}

      {/* Subject Selection Modal */}
      {showSubjectSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Chọn môn học để tạo lịch</h3>
                <button
                  onClick={toggleSubjectSelector}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.length === subjects.length}
                      onChange={toggleSelectAllSubjects}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Chọn tất cả ({subjects.length} môn)
                  </label>
                </div>

                <div className="space-y-2">
                  {subjects.map((subject) => (
                    <label key={subject.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subject.id)}
                        onChange={(e) => handleSubjectSelection(subject.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          <span className="font-medium text-gray-900">{subject.name}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {subject.chapters_count} chương • Thi: {new Date(subject.exam_date).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Đã chọn: {selectedSubjects.length}/{subjects.length} môn học
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={toggleSubjectSelector}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      toggleSubjectSelector();
                      if (selectedSubjects.length > 0) {
                        generateSchedule();
                      }
                    }}
                    disabled={selectedSubjects.length === 0}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Tạo lịch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
