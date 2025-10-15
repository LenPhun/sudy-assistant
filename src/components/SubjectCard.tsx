import { Subject } from '../lib/supabase';
import { Calendar, BookOpen, Trash2, AlertCircle } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  onDelete: (id: string) => void;
}

export function SubjectCard({ subject, onDelete }: SubjectCardProps) {
  const daysUntilExam = Math.ceil(
    (new Date(subject.exam_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800 border-green-200';
    if (level <= 3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getUrgencyColor = (days: number) => {
    if (days < 0) return 'text-gray-500';
    if (days <= 7) return 'text-red-600';
    if (days <= 14) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all border-2 border-gray-100 overflow-hidden group">
      <div className="h-2" style={{ backgroundColor: subject.color }}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{subject.name}</h3>
          <button
            onClick={() => onDelete(subject.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:bg-red-50 p-2 rounded-lg"
            title="Xóa môn học"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-sm">
              Ngày thi: <span className="font-semibold">{new Date(subject.exam_date).toLocaleDateString('vi-VN')}</span>
            </span>
          </div>

          {daysUntilExam >= 0 ? (
            <div className={`flex items-center gap-2 ${getUrgencyColor(daysUntilExam)}`}>
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Còn {daysUntilExam} ngày
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">Đã qua ngày thi</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-gray-700">
            <BookOpen className="w-4 h-4 text-green-600" />
            <span className="text-sm">
              {subject.chapters_count} chương
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(
                subject.difficulty_level
              )}`}
            >
              Độ khó: {subject.difficulty_level}/5
            </span>
            <span className="text-xs text-gray-600">
              {subject.study_days_per_week} buổi/tuần
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
