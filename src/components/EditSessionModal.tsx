import { useState } from 'react';
import { StudySession, Subject } from '../lib/supabase';
import { X, Check } from 'lucide-react';

interface EditSessionModalProps {
  session: StudySession;
  subjects: Subject[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<StudySession>) => void;
}

export function EditSessionModal({ session, subjects, onClose, onUpdate }: EditSessionModalProps) {
  const [sessionDate, setSessionDate] = useState(session.session_date);
  const [startTime, setStartTime] = useState(session.start_time.slice(0, 5));
  const [endTime, setEndTime] = useState(session.end_time.slice(0, 5));
  const [chapterTopic, setChapterTopic] = useState(session.chapter_topic);
  const [notes, setNotes] = useState(session.notes);
  const [isCompleted, setIsCompleted] = useState(session.is_completed);

  const subject = subjects.find((s) => s.id === session.subject_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(session.id, {
      session_date: sessionDate,
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
      chapter_topic: chapterTopic,
      notes,
      is_completed: isCompleted,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Chỉnh Sửa Buổi Học</h2>
            <p className="text-sm text-gray-600 mt-1">{subject?.name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày Học
            </label>
            <input
              type="date"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ Bắt Đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ Kết Thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chương/Chủ Đề
            </label>
            <input
              type="text"
              value={chapterTopic}
              onChange={(e) => setChapterTopic(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ví dụ: Chương 1 - Giới thiệu"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi Chú
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Ghi chú về buổi học..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="completed"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="completed" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Đã hoàn thành
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Cập Nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
