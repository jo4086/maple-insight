// File: components/interactive/DynamicFab/index.tsx

import { useState } from 'react';

import { SelectBox3 } from '../SelectBox3';

import { Fab } from '@/components/shared';
// import { useNavigate } from 'react-router-dom';

type CategoryItem = { id: string; label: string; path?: string; action?: string };
type Category = { id: string; label: string; items: CategoryItem[] };

interface DynamicFabProps {
  categories: Category[];
  defaultCategoryId?: string;
}

export const DynamicFab = ({ categories, defaultCategoryId }: DynamicFabProps) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(defaultCategoryId ?? categories[0]?.id ?? '');
  const [_isFabListVisible, setFabListVisible] = useState(false);
  const [_isSelectOpen, setSelectOpen] = useState(false);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  const handleSelectOpenChange = (open: boolean) => {
    setSelectOpen(open);
    if (open) {
      setFabListVisible(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setActiveCategoryId(value);
  };

  // 향후 콜백형태로 리팩토링시 path외의 기능 추가 가능
  // const navigate = useNavigate();
  // const handleNavigate = (path: string) => {
  //   navigate(path);
  //   setFabListVisible(false);
  // };

  return (
    <Fab
      label={
        <div className="w-full">
          <SelectBox3 value={activeCategoryId} onValueChange={handleCategoryChange} placeholder="카테고리 선택" onOpenChange={handleSelectOpenChange}>
            <SelectBox3.Trigger />
            <SelectBox3.Options>
              {categories.map((cat) => (
                <SelectBox3.Option key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectBox3.Option>
              ))}
            </SelectBox3.Options>
          </SelectBox3>
        </div>
      }
      items={activeCategory.items}
      classNames={{
        actionBtn: 'bg-slate-700 text-white',
      }}
    />
  );
};
