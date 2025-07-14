import React, { useState, useEffect } from 'react';
import { API } from '../services/apiService';
import Utils from '../lib/utils';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { useLoading } from '../components/Loading';
import { useNotification } from '../components/Notification';
import { useModal } from '../components/Modal';

interface Ad {
  _id: string;
  title: string;
  description?: string;
  position: 'main' | 'detail';
  priority: number;
  image: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Advertisements: React.FC = () => {
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentEditingAd, setCurrentEditingAd] = useState<Ad | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');

  const { showLoading, hideLoading } = useLoading();
  const { showNotification } = useNotification();
  const { confirm, showModal, hideModal } = useModal();

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allAds, sortOrder]);

  const loadAds = async () => {
    showLoading();
    try {
      const response = await API.get('/advertisements');
      setAllAds(response.data);
    } catch (error) {
      console.error('광고 로드 실패:', error);
      showNotification('광고 목록을 불러오는데 실패했습니다.', 'error');
    } finally {
      hideLoading();
    }
  };

  const updateStatistics = (ads: Ad[]) => {
    const total = ads.length;
    const active = ads.filter(ad => ad.isActive).length;
    const main = ads.filter(ad => ad.position === 'main').length;
    const detail = ads.filter(ad => ad.position === 'detail').length;

    return {
      totalAdsCount: total,
      activeAdsCount: active,
      mainAdsCount: main,
      detailAdsCount: detail,
    };
  };

  const applyFilters = () => {
    const positionFilter = (document.getElementById('positionFilter') as HTMLSelectElement)?.value || '';
    const activeFilter = (document.getElementById('activeFilter') as HTMLSelectElement)?.value || '';
    const titleSearch = (document.getElementById('titleSearch') as HTMLInputElement)?.value.toLowerCase() || '';
    const priorityFilter = (document.getElementById('priorityFilter') as HTMLSelectElement)?.value || '';
    const sortBy = (document.getElementById('sortBy') as HTMLSelectElement)?.value || 'priority';

    let tempFilteredAds = allAds.filter(ad => {
      if (positionFilter && ad.position !== positionFilter) return false;
      if (activeFilter && ad.isActive.toString() !== activeFilter) return false;
      if (titleSearch && !ad.title.toLowerCase().includes(titleSearch)) return false;

      if (priorityFilter) {
        if (priorityFilter === 'high' && ad.priority < 8) return false;
        if (priorityFilter === 'medium' && (ad.priority < 4 || ad.priority > 7)) return false;
        if (priorityFilter === 'low' && ad.priority > 3) return false;
      }
      return true;
    });

    tempFilteredAds.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Ad];
      let bValue: any = b[sortBy as keyof Ad];

      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAds(tempFilteredAds);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  const resetFilters = () => {
    (document.getElementById('positionFilter') as HTMLSelectElement).value = '';
    (document.getElementById('activeFilter') as HTMLSelectElement).value = '';
    (document.getElementById('titleSearch') as HTMLInputElement).value = '';
    (document.getElementById('priorityFilter') as HTMLSelectElement).value = '';
    (document.getElementById('sortBy') as HTMLSelectElement).value = 'priority';
    setSortOrder('desc');
    applyFilters();
  };

  const showAddAdModal = () => {
    setCurrentEditingAd(null);
    setImagePreviewUrl('');
    setShowAdModal(true);
  };

  const editAd = (ad: Ad) => {
    setCurrentEditingAd(ad);
    setImagePreviewUrl(ad.image);
    setShowAdModal(true);
  };

  const closeAdModal = () => {
    setShowAdModal(false);
    setCurrentEditingAd(null);
    setImagePreviewUrl('');
    hideModal();
  };

  const submitAd = async (event: React.FormEvent) => {
    event.preventDefault();
    showLoading();

    const form = event.target as HTMLFormElement;
    const formData = {
      title: (form.elements.namedItem('adTitle') as HTMLInputElement).value,
      description: (form.elements.namedItem('adDescription') as HTMLTextAreaElement).value,
      position: (form.elements.namedItem('adPosition') as HTMLSelectElement).value as 'main' | 'detail',
      priority: parseInt((form.elements.namedItem('adPriority') as HTMLInputElement).value),
      image: (form.elements.namedItem('adImage') as HTMLInputElement).value,
      link: (form.elements.namedItem('adLink') as HTMLInputElement).value || undefined,
      startDate: (form.elements.namedItem('adStartDate') as HTMLInputElement).value || undefined,
      endDate: (form.elements.namedItem('adEndDate') as HTMLInputElement).value || undefined,
      isActive: (form.elements.namedItem('adActive') as HTMLSelectElement).value === 'true',
    };

    try {
      if (currentEditingAd) {
        await API.put(`/advertisements/${currentEditingAd._id}`, formData);
        showNotification('광고가 성공적으로 수정되었습니다.', 'success');
      } else {
        await API.post('/advertisements', formData);
        showNotification('광고가 성공적으로 추가되었습니다.', 'success');
      }
      closeAdModal();
      loadAds();
    } catch (error: any) {
      console.error('광고 저장 실패:', error);
      showNotification(`광고 저장에 실패했습니다: ${error.message}`, 'error');
    } finally {
      hideLoading();
    }
  };

  const toggleAdStatus = (ad: Ad) => {
    const newStatus = !ad.isActive;
    const action = newStatus ? '활성화' : '비활성화';

    confirm(
      '광고 상태 변경',
      `'${ad.title}' 광고를 ${action}하시겠습니까?`,
      async () => {
        showLoading();
        try {
          await API.put(`/advertisements/${ad._id}`, { isActive: newStatus });
          showNotification(`광고가 ${action}되었습니다.`, 'success');
          loadAds();
        } catch (error) {
          console.error('광고 상태 변경 실패:', error);
          showNotification('광고 상태 변경에 실패했습니다.', 'error');
        } finally {
          hideLoading();
        }
      }
    );
  };

  const deleteAd = (ad: Ad) => {
    confirm(
      '광고 삭제',
      `'${ad.title}' 광고를 삭제하시겠습니까?<br><strong>이 작업은 되돌릴 수 없습니다.</strong>`,
      async () => {
        showLoading();
        try {
          await API.delete(`/advertisements/${ad._id}`);
          showNotification('광고가 성공적으로 삭제되었습니다.', 'success');
          loadAds();
        } catch (error) {
          console.error('광고 삭제 실패:', error);
          showNotification('광고 삭제에 실패했습니다.', 'error');
        } finally {
          hideLoading();
        }
      }
    );
  };

  const adColumns = [
    {
      key: 'image',
      header: '이미지',
      render: (value: string) =>
        value ? (
          <img
            src={value}
            alt="광고"
            style={{
              width: '100px',
              height: '60px',
              objectFit: 'cover',
              borderRadius: '5px',
            }}
          />
        ) : (
          <div
            style={{
              width: '100px',
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
    { key: 'title', header: '제목', render: (value: string) => <strong>{value}</strong> },
    {
      key: 'description',
      header: '설명',
      render: (value: string) => (value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'),
    },
    { key: 'position', header: '위치', render: (value: string) => (value === 'main' ? '메인 화면' : '상세 화면') },
    {
      key: 'priority',
      header: '우선순위',
      render: (value: number) => (
        <span className={`badge ${value >= 8 ? 'badge-danger' : value >= 4 ? 'badge-warning' : 'badge-info'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'isActive',
      header: '상태',
      render: (value: boolean) =>
        value ? (
          <span className="badge badge-success">활성</span>
        ) : (
          <span className="badge badge-secondary">비활성</span>
        ),
    },
    { key: 'updatedAt', header: '최근 수정', render: (value: string) => Utils.formatDate(value) },
  ];

  const adActions = [
    {
      text: '수정',
      class: 'btn-primary',
      onClick: (ad: Ad) => editAd(ad),
    },
    {
      text: (ad: Ad) => (ad.isActive ? '비활성화' : '활성화'),
      class: (ad: Ad) => (ad.isActive ? 'btn-warning' : 'btn-success'),
      onClick: (ad: Ad) => toggleAdStatus(ad),
    },
    {
      text: '삭제',
      class: 'btn-danger',
      onClick: (ad: Ad) => deleteAd(ad),
    },
  ];

  const statistics = updateStatistics(allAds);

  return (
    <div>
      <div className="card-header">
        <h1 className="card-title">광고 관리</h1>
        <button className="btn btn-success" onClick={showAddAdModal}>
          ➕ 새 광고 추가
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
            <label className="form-label">광고 위치</label>
            <select className="form-select" id="positionFilter" onChange={applyFilters}>
              <option value="">전체 위치</option>
              <option value="main">메인 화면</option>
              <option value="detail">상세 화면</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">활성 상태</label>
            <select className="form-select" id="activeFilter" onChange={applyFilters}>
              <option value="">전체 상태</option>
              <option value="true">활성</option>
              <option value="false">비활성</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">제목 검색</label>
            <input type="text" className="form-control" id="titleSearch" placeholder="광고 제목을 입력하세요" onKeyUp={applyFilters} />
          </div>
          <div className="form-group">
            <label className="form-label">우선순위</label>
            <select className="form-select" id="priorityFilter" onChange={applyFilters}>
              <option value="">전체 우선순위</option>
              <option value="high">높음 (8-10)</option>
              <option value="medium">보통 (4-7)</option>
              <option value="low">낮음 (1-3)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <StatCard number={statistics.totalAdsCount} label="전체 광고" />
        <StatCard number={statistics.activeAdsCount} label="활성 광고" />
        <StatCard number={statistics.mainAdsCount} label="메인 화면" />
        <StatCard number={statistics.detailAdsCount} label="상세 화면" />
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">광고 목록</h2>
          <div className="d-flex gap-2">
            <select className="form-select" id="sortBy" onChange={applyFilters} style={{ width: '200px' }}>
              <option value="priority">우선순위순</option>
              <option value="title">제목순</option>
              <option value="position">위치순</option>
              <option value="createdAt">생성일순</option>
              <option value="updatedAt">수정일순</option>
            </select>
            <button className="btn btn-sm btn-secondary" onClick={toggleSortOrder}>
              <span id="sortOrderText">{sortOrder === 'asc' ? '⬆️' : '⬇️'}</span>
            </button>
          </div>
        </div>
        <DataTable data={filteredAds} columns={adColumns} actions={adActions} />
      </div>

      {showAdModal && (
        <div id="adModal" className="modal" style={{ display: 'block' }}>
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <span className="modal-close" onClick={closeAdModal}>&times;</span>
            <h2 id="modalTitle">{currentEditingAd ? '광고 수정' : '새 광고 추가'}</h2>
            
            <form id="adForm" onSubmit={submitAd}>
                <div className="form-group">
                    <label className="form-label">광고 제목 *</label>
                    <input type="text" className="form-control" id="adTitle" required defaultValue={currentEditingAd?.title || ''} />
                </div>

                <div className="form-group">
                    <label className="form-label">광고 설명</label>
                    <textarea className="form-control" id="adDescription" rows={3} placeholder="광고 설명을 입력하세요" defaultValue={currentEditingAd?.description || ''}></textarea>
                </div>

                <div className="grid grid-2">
                    <div className="form-group">
                        <label className="form-label">광고 위치 *</label>
                        <select className="form-select" id="adPosition" required defaultValue={currentEditingAd?.position || ''}>
                            <option value="">위치 선택</option>
                            <option value="main">메인 화면</option>
                            <option value="detail">상세 화면</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">우선순위 *</label>
                        <input type="number" className="form-control" id="adPriority" required min={1} max={10} defaultValue={currentEditingAd?.priority || 5} />
                        <small>1(낮음) ~ 10(높음)</small>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">이미지 URL *</label>
                    <input type="url" className="form-control" id="adImage" required placeholder="이미지 URL을 입력하세요" defaultValue={currentEditingAd?.image || ''} onChange={(e) => setImagePreviewUrl(e.target.value)} />
                    <small>예: /img/ad_img_3.jpg</small>
                </div>

                <div className="form-group">
                    <label className="form-label">링크 URL</label>
                    <input type="url" className="form-control" id="adLink" placeholder="클릭 시 이동할 URL (선택사항)" defaultValue={currentEditingAd?.link || ''} />
                </div>

                <div className="grid grid-2">
                    <div className="form-group">
                        <label className="form-label">시작일</label>
                        <input type="date" className="form-control" id="adStartDate" defaultValue={currentEditingAd?.startDate?.split('T')[0] || ''} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">종료일</label>
                        <input type="date" className="form-control" id="adEndDate" defaultValue={currentEditingAd?.endDate?.split('T')[0] || ''} />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">활성 상태</label>
                    <select className="form-select" id="adActive" defaultValue={currentEditingAd?.isActive.toString() || 'true'}>
                        <option value="true">활성</option>
                        <option value="false">비활성</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">이미지 미리보기</label>
                    <div id="imagePreview" style={{ width: '100%', height: '200px', border: '2px dashed #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', borderRadius: '8px' }}>
                        {imagePreviewUrl ? (
                            <img src={imagePreviewUrl} alt="미리보기" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '5px' }} onError={(e) => (e.currentTarget.src = '')} />
                        ) : (
                            '이미지 URL을 입력하면 미리보기가 표시됩니다'
                        )}
                    </div>
                </div>

                <div className="d-flex justify-content-between mt-3">
                    <button type="button" className="btn btn-secondary" onClick={closeAdModal}>
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

export default Advertisements;