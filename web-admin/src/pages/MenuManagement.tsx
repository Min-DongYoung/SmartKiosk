import React, { useState, useEffect } from 'react';
import { API } from '../services/apiService';
import Utils from '../lib/utils';
import DataTable from '../components/DataTable';
import { useLoading } from '../components/Loading';
import { useNotification } from '../components/Notification';
import { useModal } from '../components/Modal';
import StatCard from '../components/StatCard';

interface MenuItem {
  _id: string;
  id: string; // Added id field
  name: string;
  category: string;
  price: number;
  image?: string;
  description?: string;
  isAvailable: boolean;
  options: {
    size?: string[];
    temperature?: string[];
    extras?: string[];
  };
  updatedAt: string;
}

const MenuManagement: React.FC = () => {
  const [allMenus, setAllMenus] = useState<MenuItem[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<MenuItem[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentEditingMenu, setCurrentEditingMenu] = useState<MenuItem | null>(null);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();
  const { confirm, showModal, hideModal } = useModal();

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = async () => {
    showLoading();
    try {
      const response = await API.get('/menus');
      setAllMenus(response.data);
      setFilteredMenus(response.data);
      updateStatistics(response.data);
      applyFilters();
    } catch (error) {
      console.error('메뉴 로드 실패:', error);
      showNotification('메뉴 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  };

  const updateStatistics = (menus: MenuItem[]) => {
    const total = menus.length;
    const available = menus.filter(menu => menu.isAvailable).length;
    const soldOut = total - available;
    const averagePrice = total > 0 ? Math.round(menus.reduce((sum, menu) => sum + menu.price, 0) / total) : 0;

    // These would typically update state variables for display in StatCards
    // For now, we'll just log them or assume they'll be passed to StatCard components
    console.log({
      totalMenusCount: total,
      availableMenusCount: available,
      soldOutMenusCount: soldOut,
      averagePrice: Utils.formatPrice(averagePrice),
    });
  };

  const applyFilters = () => {
    const categoryFilter = (document.getElementById('categoryFilter') as HTMLSelectElement)?.value || '';
    const availabilityFilter = (document.getElementById('availabilityFilter') as HTMLSelectElement)?.value || '';
    const searchInput = (document.getElementById('searchInput') as HTMLInputElement)?.value.toLowerCase() || '';
    const priceRangeFilter = (document.getElementById('priceRangeFilter') as HTMLSelectElement)?.value || '';
    const sortBy = (document.getElementById('sortBy') as HTMLSelectElement)?.value || 'name';

    let tempFilteredMenus = allMenus.filter(menu => {
      if (categoryFilter && menu.category !== categoryFilter) return false;
      if (availabilityFilter && menu.isAvailable.toString() !== availabilityFilter) return false;
      if (searchInput && !menu.name.toLowerCase().includes(searchInput)) return false;

      if (priceRangeFilter) {
        const [min, max] = priceRangeFilter.split('-').map(Number);
        if (menu.price < min || menu.price > max) return false;
      }
      return true;
    });

    tempFilteredMenus.sort((a, b) => {
      let aValue: any = a[sortBy as keyof MenuItem];
      let bValue: any = b[sortBy as keyof MenuItem];

      if (sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredMenus(tempFilteredMenus);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    applyFilters();
  };

  const resetFilters = () => {
    (document.getElementById('categoryFilter') as HTMLSelectElement).value = '';
    (document.getElementById('availabilityFilter') as HTMLSelectElement).value = '';
    (document.getElementById('searchInput') as HTMLInputElement).value = '';
    (document.getElementById('priceRangeFilter') as HTMLSelectElement).value = '';
    (document.getElementById('sortBy') as HTMLSelectElement).value = 'name';
    setSortOrder('asc');
    applyFilters();
  };

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
    hideModal(); // Ensure modal is hidden if opened via useModal
  };

  const submitMenu = async (event: React.FormEvent) => {
    event.preventDefault();
    showLoading();

    const form = event.target as HTMLFormElement;
    const formData = {
      id: (form.elements.namedItem('menuId') as HTMLInputElement).value,
      name: (form.elements.namedItem('menuName') as HTMLInputElement).value,
      category: (form.elements.namedItem('menuCategory') as HTMLSelectElement).value,
      price: parseInt((form.elements.namedItem('menuPrice') as HTMLInputElement).value),
      description: (form.elements.namedItem('menuDescription') as HTMLTextAreaElement).value,
      image: (form.elements.namedItem('menuImage') as HTMLInputElement).value,
      isAvailable: (form.elements.namedItem('menuAvailability') as HTMLSelectElement).value === 'true',
      options: {
        size: Array.from(form.querySelectorAll('input[name="sizeOptions"]:checked')).map((cb) => (cb as HTMLInputElement).value),
        temperature: Array.from(form.querySelectorAll('input[name="temperatureOptions"]:checked')).map((cb) => (cb as HTMLInputElement).value),
        extras: Array.from(form.querySelectorAll('input[name="extraOptions"]:checked')).map((cb) => (cb as HTMLInputElement).value),
      },
    };

    try {
      if (currentEditingMenu) {
        await API.put(`/menus/${currentEditingMenu.id}`, formData);
        showNotification('메뉴가 성공적으로 수정되었습니다.', 'success');
      } else {
        await API.post('/menus', formData);
        showNotification('메뉴가 성공적으로 추가되었습니다.', 'success');
      }
      closeMenuModal();
      loadMenus();
    } catch (error: any) {
      console.error('메뉴 저장 실패:', error);
      showNotification(`메뉴 저장에 실패했습니다: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  };

  const toggleMenuAvailability = (menu: MenuItem) => {
    const newStatus = !menu.isAvailable;
    const action = newStatus ? '판매 재개' : '품절 처리';

    confirm(
      '판매 상태 변경',
      `'${menu.name}' 메뉴를 ${action}하시겠습니까?`,
      async () => {
        showLoading();
        try {
          await API.put(`/menus/${menu.id}`, { isAvailable: newStatus });
          showNotification(`메뉴가 ${action}되었습니다.`, 'success');
          loadMenus();
        } catch (error) {
          console.error('메뉴 상태 변경 실패:', error);
          showNotification('메뉴 상태 변경에 실패했습니다.', 'error');
        } finally {
          hideLoading();
        }
      }
    );
  };

  const deleteMenu = (menu: MenuItem) => {
    confirm(
      '메뉴 삭제',
      `'${menu.name}' 메뉴를 삭제하시겠습니까?<br><strong>이 작업은 되돌릴 수 없습니다.</strong>`,
      async () => {
        showLoading();
        try {
          await API.delete(`/menus/${menu.id}`);
          showNotification('메뉴가 성공적으로 삭제되었습니다.', 'success');
          loadMenus();
        } catch (error) {
          console.error('메뉴 삭제 실패:', error);
          showNotification('메뉴 삭제에 실패했습니다.', 'error');
        } finally {
          hideLoading();
        }
      }
    );
  };

  const menuColumns = [
    {
      key: 'image',
      header: '이미지',
      render: (value: string) =>
        value ? (
          <img
            src={value}
            alt="메뉴"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '5px',
            }}
          />
        ) : (
          <div
            style={{
              width: '60px',
              height: '60px',
              background: '#f0f0f0',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
            }}
          >
            이미지<br />없음
          </div>
        ),
    },
    { key: 'name', header: '메뉴명' },
    { key: 'category', header: '카테고리', render: (value: string) => Utils.getCategoryName(value) },
    { key: 'price', header: '가격', render: (value: number) => Utils.formatPrice(value) },
    {
      key: 'isAvailable',
      header: '판매 상태',
      render: (value: boolean) =>
        value ? (
          <span className="badge badge-success">판매 중</span>
        ) : (
          <span className="badge badge-danger">품절</span>
        ),
    },
    {
      key: 'options',
      header: '옵션',
      render: (value: { size?: string[]; temperature?: string[]; extras?: string[] }) => {
        const optionCount = (value.size?.length || 0) + (value.temperature?.length || 0) + (value.extras?.length || 0);
        return optionCount > 0 ? `${optionCount}개` : '없음';
      },
    },
    { key: 'updatedAt', header: '최근 수정', render: (value: string) => Utils.formatDate(value) },
  ];

  const menuActions = [
    {
      text: '수정',
      class: 'btn-primary',
      onClick: (menu: MenuItem) => editMenu(menu),
    },
    {
      text: (menu: MenuItem) => (menu.isAvailable ? '품절' : '판매'),
      class: (menu: MenuItem) => (menu.isAvailable ? 'btn-warning' : 'btn-success'),
      onClick: (menu: MenuItem) => toggleMenuAvailability(menu),
    },
    {
      text: '삭제',
      class: 'btn-danger',
      onClick: (menu: MenuItem) => deleteMenu(menu),
    },
  ];

  const categories = [
    { value: '', label: '전체 카테고리' },
    { value: '커피', label: '커피' },
    { value: '티', label: '티' },
    { value: '스무디', label: '스무디' },
    { value: '라떼', label: '라떼' },
    { value: '에이드', label: '에이드' },
    { value: '디저트', label: '디저트' },
  ];

  const priceRanges = [
    { value: '', label: '전체 가격' },
    { value: '0-3000', label: '0 - 3,000원' },
    { value: '3000-5000', label: '3,000 - 5,000원' },
    { value: '5000-10000', label: '5,000 - 10,000원' },
    { value: '10000-999999', label: '10,000원 이상' },
  ];

  const sortByOptions = [
    { value: 'name', label: '이름순' },
    { value: 'price', label: '가격순' },
    { value: 'category', label: '카테고리순' },
    { value: 'updatedAt', label: '최근 수정순' },
  ];

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">메뉴 관리</h1>
        <button className="btn btn-success" onClick={showAddMenuModal}>
          ➕ 새 메뉴 추가
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">필터 및 검색</h2>
          <button className="btn btn-sm btn-secondary" onClick={resetFilters}>
            🔄 필터 초기화
          </button>
        </div>
        <div className="grid grid-4">
          <div className="form-group">
            <label className="form-label">카테고리</label>
            <select className="form-select" id="categoryFilter" onChange={applyFilters}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">판매 상태</label>
            <select className="form-select" id="availabilityFilter" onChange={applyFilters}>
              <option value="">전체 상태</option>
              <option value="true">판매 중</option>
              <option value="false">품절</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">메뉴명 검색</label>
            <input type="text" className="form-control" id="searchInput" placeholder="메뉴명을 입력하세요" onKeyUp={applyFilters} />
          </div>
          <div className="form-group">
            <label className="form-label">가격 범위</label>
            <select className="form-select" id="priceRangeFilter" onChange={applyFilters}>
              {priceRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 메뉴 통계 */}
      <div className="grid grid-4">
        <StatCard number={allMenus.length} label="전체 메뉴" />
        <StatCard number={allMenus.filter(menu => menu.isAvailable).length} label="판매 중" />
        <StatCard number={allMenus.length - allMenus.filter(menu => menu.isAvailable).length} label="품절" />
        <StatCard number={allMenus.length > 0 ? Utils.formatPrice(Math.round(allMenus.reduce((sum, menu) => sum + menu.price, 0) / allMenus.length)) : Utils.formatPrice(0)} label="평균 가격" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">메뉴 목록</h2>
          <div className="d-flex gap-2">
            <select className="form-select" id="sortBy" onChange={applyFilters} style={{ width: '200px' }}>
              {sortByOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-secondary" onClick={toggleSortOrder}>
              <span id="sortOrderText">{sortOrder === 'asc' ? '⬆️' : '⬇️'}</span>
            </button>
          </div>
        </div>
        <DataTable data={filteredMenus} columns={menuColumns} actions={menuActions} />
      </div>

      {showMenuModal && (
        <div id="menuModal" className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <span className="modal-close" onClick={closeMenuModal}>&times;</span>
            <h2 id="modalTitle">{currentEditingMenu ? '메뉴 수정' : '새 메뉴 추가'}</h2>
            
            <form id="menuForm" onSubmit={submitMenu}>
                <div className="grid grid-2">
                    <div className="form-group">
                        <label className="form-label">메뉴 ID *</label>
                        <input type="text" className="form-control" id="menuId" required defaultValue={currentEditingMenu?.id || ''} disabled={!!currentEditingMenu} />
                        <small>영문, 숫자, 하이픈만 사용 가능</small>
                    </div>
                    <div className="form-group">
                        <label className="form-label">메뉴명 *</label>
                        <input type="text" className="form-control" id="menuName" required defaultValue={currentEditingMenu?.name || ''} />
                    </div>
                </div>

                <div className="grid grid-2">
                    <div className="form-group">
                        <label className="form-label">카테고리 *</label>
                        <select className="form-select" id="menuCategory" required defaultValue={currentEditingMenu?.category || ''}>
                            <option value="">카테고리 선택</option>
                            <option value="커피">커피</option>
                            <option value="티">티</option>
                            <option value="스무디">스무디</option>
                            <option value="라떼">라떼</option>
                            <option value="에이드">에이드</option>
                            <option value="디저트">디저트</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">가격 *</label>
                        <input type="number" className="form-control" id="menuPrice" required min={0} defaultValue={currentEditingMenu?.price || ''} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">설명</label>
                    <textarea className="form-control" id="menuDescription" rows={3} placeholder="메뉴 설명을 입력하세요" defaultValue={currentEditingMenu?.description || ''}></textarea>
                </div>

                <div className="form-group">
                    <label className="form-label">이미지 URL</label>
                    <input type="url" className="form-control" id="menuImage" placeholder="이미지 URL을 입력하세요" defaultValue={currentEditingMenu?.image || ''} />
                    <small>예: /img/coffee/아메리카노.jpg</small>
                </div>

                <div className="form-group">
                    <label className="form-label">옵션 설정</label>
                    <div className="grid grid-3">
                        <div>
                            <label className="form-label">사이즈</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" name="sizeOptions" value="small" defaultChecked={currentEditingMenu?.options?.size?.includes('small')} /> 스몰</label>
                                <label><input type="checkbox" name="sizeOptions" value="medium" defaultChecked={currentEditingMenu?.options?.size?.includes('medium')} /> 미디엄</label>
                                <label><input type="checkbox" name="sizeOptions" value="large" defaultChecked={currentEditingMenu?.options?.size?.includes('large')} /> 라지</label>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">온도</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" name="temperatureOptions" value="hot" defaultChecked={currentEditingMenu?.options?.temperature?.includes('hot')} /> HOT</label>
                                <label><input type="checkbox" name="temperatureOptions" value="ice" defaultChecked={currentEditingMenu?.options?.temperature?.includes('ice')} /> ICE</label>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">추가 옵션</label>
                            <div className="checkbox-group">
                                <label><input type="checkbox" name="extraOptions" value="extra-shot" defaultChecked={currentEditingMenu?.options?.extras?.includes('extra-shot')} /> 샷 추가</label>
                                <label><input type="checkbox" name="extraOptions" value="decaf" defaultChecked={currentEditingMenu?.options?.extras?.includes('decaf')} /> 디카페인</label>
                                <label><input type="checkbox" name="extraOptions" value="soy-milk" defaultChecked={currentEditingMenu?.options?.extras?.includes('soy-milk')} /> 두유</label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">판매 상태</label>
                    <select className="form-select" id="menuAvailability" defaultValue={currentEditingMenu?.isAvailable.toString() || 'true'}>
                        <option value="true">판매 중</option>
                        <option value="false">품절</option>
                    </select>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <button type="button" className="btn btn-secondary" onClick={closeMenuModal}>
                        취소
                    </button>
                    <button type="submit" className="btn btn-success">
                        저장
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
