'use client';
// 예시 컴포넌트입니다. 사용하지 마세요.











import { useEffect, useState } from 'react';
import { UserApi, type User } from '@/lib/api/users';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
  });

  // 사용자 정보 로드
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const response = await UserApi.getCurrentUser();
      setUser(response.data);
      setFormData({
        name: response.data.name,
        bio: response.data.bio || '',
      });
    } catch (error) {
      toast.error('사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await UserApi.updateUser(user.id, {
        name: formData.name,
        bio: formData.bio,
      });
      setUser(response.data);
      setIsEditing(false);
      toast.success('프로필이 업데이트되었습니다.');
    } catch (error) {
      toast.error('프로필 업데이트에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  if (!user) {
    return <div>사용자를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        {!isEditing ? (
          <>
            <div className="flex items-center space-x-4 mb-4">
              {user.profileImage && (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            {user.bio && <p className="text-gray-700 mb-4">{user.bio}</p>}
            <Button onClick={() => setIsEditing(true)}>프로필 수정</Button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이름
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                소개
              </label>
              <Textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit">저장</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                취소
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 