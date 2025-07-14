import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Alert, AlertDescription } from '@/components/ui/alert';
// import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { API, Utils } from '../lib/utils'; // 유틸리티 함수 임포트

// 임시 UI 컴포넌트 (Shadcn UI 설치 전까지 사용)
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`mb-2 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={className}>{children}</div>;
const Alert = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-4 rounded-lg ${className}`}>{children}</div>;
const AlertDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => <p className={className}>{children}</p>;
const AlertDialog = ({ children, open, onOpenChange }: { children: React.ReactNode, open: boolean, onOpenChange: (open: boolean) => void }) => open ? <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => onOpenChange(false)}>{children}</div> : null;
const AlertDialogContent = ({ children }: { children: React.ReactNode }) => <div className="bg-white p-6 rounded-lg shadow-lg" onClick={e => e.stopPropagation()}>{children}</div>;
const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => <div className="mb-4">{children}</div>;
const AlertDialogTitle = ({ children }: { children: React.ReactNode }) => <h4 className="text-xl font-bold mb-2">{children}</h4>;
const AlertDialogDescription = ({ children }: { children: React.ReactNode }) => <p className="text-gray-600 mb-4">{children}</p>;
const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => <div className="flex justify-end gap-2">{children}</div>;
const AlertDialogAction = ({ children, onClick, type = 'button' }: { children: React.ReactNode, onClick?: () => void, type?: 'button' | 'submit' }) => <button type={type} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={onClick}>{children}</button>;

interface MenuItem {
  _id: string;
  name: string;
  category: string;
  price: number;
  imageUrl?: string;
  description?: string;
  isAvailable: boolean;
  temperatureOptions?: string[];
  sizeOptions?: string[];
  adminPriority?: number | null;
  popularity?: number | null;
  tags?: string[];
}

const MenuManagement = () => {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ menuId: string, currentStatus: boolean } | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [currentEditingMenu, setCurrentEditingMenu] = useState<MenuItem | null>(null);

  // 메뉴 데이터 로드
  useEffect(() => {
    fetchMenus();
    // 5초마다 자동 새로고침
    const interval = setInterval(fetchMenus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await API.get('/menu?available=all');
      if (response.success) {
        setMenus(response.data);
      }
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 품절 상태 토글
  const toggleAvailability = async (menuId: string, currentStatus: boolean) => {
    setPendingAction({ menuId, currentStatus });
    setShowConfirmDialog(true);
  };

  const confirmToggle = async () => {
    if (!pendingAction) return;

    try {
      const response = await API.patch(`/menu/${pendingAction.menuId}/availability`);

      if (response.success) {
        // 즉시 UI 업데이트
        setMenus(menus.map((menu) => 
          menu._id === pendingAction.menuId 
            ? { ...menu, isAvailable: !menu.isAvailable } 
            : menu
        ));
      }
    } catch (error) {
      console.error('상태 변경 실패:', error);
    } finally {
      setShowConfirmDialog(false);
      setPendingAction(null);
    }
  };

  // 가격 수정
  const updatePrice = async (menuId: string, newPrice: string) => {
    try {
      const response = await API.put(`/menu/${menuId}`, { price: parseInt(newPrice) });

      if (response.success) {
        fetchMenus(); // 전체 새로고침
      }
    } catch (error) {
      console.error('가격 변경 실패:', error);
    }
  };

  // 추천 메뉴 토글 (tags 필드 사용)
  const toggleRecommended = async (menuId: string, currentTags: string[]) => {
    const isRecommended = currentTags?.includes('추천');
    const newTags = isRecommended 
      ? currentTags.filter(tag => tag !== '추천')
      : [...(currentTags || []), '추천'];

    try {
      const response = await API.put(`/menu/${menuId}`, { tags: newTags });

      if (response.success) {
        setMenus(menus.map((menu) => 
          menu._id === menuId ? { ...menu, tags: newTags } : menu
        ));
      }
    } catch (error) {
      console.error('추천 상태 변경 실패:', error);
    }
  };

  const filteredMenus = selectedCategory === 'all' 
    ? menus 
    : menus.filter((menu) => menu.category === selectedCategory);

  const categories = [
    { value: 'all', label: '전체' },
    { value: '커피', label: '커피' },
    { value: '라떼', label: '라떼' },
    { value: '에이드', label: '에이드' },
    { value: '스무디', label: '스무디' },
    { value: '티', label: '티' },
    { value: '디저트', label: '디저트' }
  ];

  const showAddMenuModal = () => {
    setCurrentEditingMenu(null);
    setShowMenuModal(true);
  };

  const editMenu = (menu: MenuItem) => {
    setCurrentEditingMenu(menu);
    setShowMenuModal(true);
  };

  const closeMenuModal = () => {
    setShowMenuModal(false);
    setCurrentEditingMenu(null);
  };

  const submitMenu = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData: Partial<MenuItem> = {
      name: form.menuName.value,
      category: form.menuCategory.value,
      price: parseInt(form.menuPrice.value),
      description: form.menuDescription.value as string, // string으로 명시적 캐스팅
      imageUrl: form.menuImage.value,
      isAvailable: form.menuAvailability.value === 'true',
      temperatureOptions: (Array.from(form.querySelectorAll('input[name="temperatureOptions"]:checked')) as HTMLInputElement[]).map((cb) => cb.value),
      sizeOptions: (Array.from(form.querySelectorAll('input[name="sizeOptions"]:checked')) as HTMLInputElement[]).map((cb) => cb.value),
      adminPriority: form.adminPriority.value ? parseInt(form.adminPriority.value) : null,
      popularity: form.popularity.value ? parseInt(form.popularity.value) : null,
      // extras, tags, nutritionInfo 등은 필요에 따라 추가
    };

    try {
      if (currentEditingMenu) {
        await API.put(`/menu/${currentEditingMenu._id}`, formData);
        alert('메뉴가 성공적으로 수정되었습니다.');
      } else {
        await API.post('/menu', formData);
        alert('메뉴가 성공적으로 추가되었습니다.');
      }
      closeMenuModal();
      fetchMenus();
    } catch (error) {
      console.error('메뉴 저장 실패:', error);
      alert('메뉴 저장에 실패했습니다.');
    }
  };

  const deleteMenu = async (menuId: string) => {
    if (window.confirm('정말로 이 메뉴를 삭제하시겠습니까?')) {
      try {
        await API.delete(`/menu/${menuId}`);
        alert('메뉴가 성공적으로 삭제되었습니다.');
        fetchMenus();
      } catch (error) {
        console.error('메뉴 삭제 실패:', error);
        alert('메뉴 삭제에 실패했습니다.');
      }
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-xl">메뉴 로딩 중...</div>
    </div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">메뉴 관리</h1>
      
      {/* 실시간 상태 표시 */}
      <Alert className="mb-6 bg-green-50 border-green-300">
        <AlertDescription className="text-green-800">
          실시간 연동 중 - 변경사항이 즉시 키오스크에 반영됩니다
        </AlertDescription>
      </Alert>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === cat.value
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 메뉴 추가 버튼 */}
      <button className="btn btn-success mb-6" onClick={showAddMenuModal}>
        ➕ 새 메뉴 추가
      </button>

      {/* 메뉴 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenus.map((menu) => (
          <Card key={menu._id} className={`${!menu.isAvailable ? 'opacity-60' : ''}`}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{menu.name}</span>
                <span className="text-sm font-normal text-gray-500">
                  {Utils.getCategoryName(menu.category)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 이미지 */}
              {menu.imageUrl && (
                <img src={menu.imageUrl} alt={menu.name} className="w-full h-32 object-cover rounded-md mb-4" />
              )}
              {/* 가격 */}
              <div className="mb-2">
                <span className="text-lg font-bold">{Utils.formatPrice(menu.price)}</span>
              </div>
              {/* 설명 */}
              {menu.description && (
                <p className="text-sm text-gray-600 mb-2">{menu.description}</p>
              )}
              {/* 옵션 */}
              {(menu.temperatureOptions && menu.temperatureOptions.length > 0 || menu.sizeOptions && menu.sizeOptions.length > 0) && (
                <div className="text-xs text-gray-500 mb-2">
                  옵션: {menu.temperatureOptions?.join(', ')}{menu.temperatureOptions?.length > 0 && menu.sizeOptions?.length > 0 ? ', ' : ''}{menu.sizeOptions?.join(', ')}
                </div>
              )}
              {/* 태그 */}
              <div className="flex gap-2 mb-4">
                {menu.tags?.map((tag: string) => (
                  <span key={tag} className={`px-2 py-1 rounded text-xs ${
                    tag === '추천' ? 'bg-yellow-200' : 'bg-gray-200'
                  }`}>
                    {tag}
                  </span>
                ))}
              </div>
              {/* adminPriority, popularity */}
              <div className="text-xs text-gray-500 mb-4">
                우선순위: {menu.adminPriority || '-'} | 인기도: {menu.popularity || '-'}
              </div>

              {/* 액션 버튼들 */}
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAvailability(menu._id, menu.isAvailable)}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    menu.isAvailable
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  {menu.isAvailable ? '품절 처리' : '판매 재개'}
                </button>
                
                <button
                  onClick={() => toggleRecommended(menu._id, menu.tags || [])}
                  className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    menu.tags?.includes('추천')
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  {menu.tags?.includes('추천') ? '추천 해제' : '추천 설정'}
                </button>
              </div>

              {/* 상태 표시 */}
              {!menu.isAvailable && (
                <div className="mt-3 text-red-600 text-sm font-medium text-center">
                  현재 품절 상태입니다
                </div>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => editMenu(menu)}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors bg-blue-500 text-white hover:bg-blue-600"
                >
                  수정
                </button>
                <button
                  onClick={() => deleteMenu(menu._id)}
                  className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors bg-gray-500 text-white hover:bg-gray-600"
                >
                  삭제
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 확인 다이얼로그 */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상태 변경 확인</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.currentStatus 
                ? '이 메뉴를 품절 처리하시겠습니까?' 
                : '이 메뉴를 판매 재개하시겠습니까?'}
              <br />
              변경사항은 모든 키오스크에 즉시 반영됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
            >
              취소
            </button>
            <AlertDialogAction onClick={confirmToggle}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 메뉴 추가/수정 모달 */}
      <AlertDialog open={showMenuModal} onOpenChange={setShowMenuModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{currentEditingMenu ? '메뉴 수정' : '새 메뉴 추가'}</AlertDialogTitle>
          </AlertDialogHeader>
          <form onSubmit={submitMenu}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">메뉴명</label>
                <input type="text" name="menuName" defaultValue={currentEditingMenu?.name || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">카테고리</label>
                <select name="menuCategory" defaultValue={currentEditingMenu?.category || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required>
                  <option value="">선택</option>
                  {categories.filter(cat => cat.value !== 'all').map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">가격</label>
                <input type="number" name="menuPrice" defaultValue={currentEditingMenu?.price || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이미지 URL</label>
                <input type="text" name="menuImage" defaultValue={currentEditingMenu?.imageUrl || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">설명</label>
              <textarea name="menuDescription" defaultValue={currentEditingMenu?.description || ''} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">우선순위 (adminPriority)</label>
                <input type="number" name="adminPriority" defaultValue={currentEditingMenu?.adminPriority || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" min="1" max="10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">인기도 (popularity)</label>
                <input type="number" name="popularity" defaultValue={currentEditingMenu?.popularity || ''} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" min="0" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">온도 옵션</label>
              <div className="flex gap-4 mt-1">
                <label className="inline-flex items-center">
                  <input type="checkbox" name="temperatureOptions" value="hot" defaultChecked={currentEditingMenu?.temperatureOptions?.includes('hot')} className="form-checkbox" />
                  <span className="ml-2">Hot</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="temperatureOptions" value="iced" defaultChecked={currentEditingMenu?.temperatureOptions?.includes('iced')} className="form-checkbox" />
                  <span className="ml-2">Iced</span>
                </label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">사이즈 옵션</label>
              <div className="flex gap-4 mt-1">
                <label className="inline-flex items-center">
                  <input type="checkbox" name="sizeOptions" value="small" defaultChecked={currentEditingMenu?.sizeOptions?.includes('small')} className="form-checkbox" />
                  <span className="ml-2">Small</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="sizeOptions" value="medium" defaultChecked={currentEditingMenu?.sizeOptions?.includes('medium')} className="form-checkbox" />
                  <span className="ml-2">Medium</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="sizeOptions" value="large" defaultChecked={currentEditingMenu?.sizeOptions?.includes('large')} className="form-checkbox" />
                  <span className="ml-2">Large</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="sizeOptions" value="piece" defaultChecked={currentEditingMenu?.sizeOptions?.includes('piece')} className="form-checkbox" />
                  <span className="ml-2">Piece</span>
                </label>
                <label className="inline-flex items-center">
                  <input type="checkbox" name="sizeOptions" value="cup" defaultChecked={currentEditingMenu?.sizeOptions?.includes('cup')} className="form-checkbox" />
                  <span className="ml-2">Cup</span>
                </label>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700">판매 상태</label>
              <select name="menuAvailability" defaultValue={currentEditingMenu?.isAvailable?.toString() || 'true'} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                <option value="true">판매 중</option>
                <option value="false">품절</option>
              </select>
            </div>
            <AlertDialogFooter>
              <button type="button" onClick={closeMenuModal} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">취소</button>
              <AlertDialogAction onClick={() => submitMenu(event)} type="submit">저장</AlertDialogAction>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MenuManagement;