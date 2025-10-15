import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Subject, StudySession } from '../lib/supabase';
import { subjectService } from '../services/subjectService';
import { studySessionService } from '../services/studySessionService';
import { SubjectCard } from './SubjectCard';
import { AddSubjectModal } from './AddSubjectModal';
import { Calendar } from './Calendar';
import { useNotifications } from '../hooks/useNotifications';
import { LogOut, Plus, Calendar as CalendarIcon, BookOpen } from 'lucide-react';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'subjects' | 'calendar'>('subjects');

  useNotifications(sessions, subjects);

  useEffect(() => {
    loadSubjects();
    loadSessions();
  }, [user]);

  const loadSubjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await subjectService.getSubjects(user.id);
      setSubjects(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async () => {
    if (!user) return;
    try {
      const data = await studySessionService.getStudySessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleAddSubject = async (subject: Omit<Subject, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await subjectService.createSubject(subject);
      await loadSubjects();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding subject:', error);
      alert('Không thể thêm môn học. Vui lòng thử lại.');
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa môn học này?')) return;
    try {
      await studySessionService.deleteAllSessionsForSubject(id);
      await subjectService.deleteSubject(id);
      await loadSubjects();
    } catch (error) {
      console.error('Error deleting subject:', error);
      alert('Không thể xóa môn học. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Trợ Lý Học Tập</h1>
                <p className="text-sm text-gray-600">Xin chào, {user?.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Đăng Xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setView('subjects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                view === 'subjects'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Môn Học
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                view === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              Lịch Học
            </button>
          </div>

          {view === 'subjects' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Thêm Môn Học
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : view === 'subjects' ? (
          <div>
            {subjects.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Chưa có môn học nào</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Thêm Môn Học Đầu Tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    onDelete={handleDeleteSubject}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <Calendar subjects={subjects} userId={user?.id || ''} />
        )}
      </div>

      {showAddModal && (
        <AddSubjectModal
          userId={user?.id || ''}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSubject}
        />
      )}
    </div>
  );
}
