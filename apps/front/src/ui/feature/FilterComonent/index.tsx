import { Button, Select } from '@/components/base';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterComponentProps {
  categories: FilterOption[];
  selectedCategory?: string;
  onCategoryChange?: (value: string) => void;
  onApplyFilter?: () => void;
  onResetFilter?: () => void;
  className?: string;
}

export function FilterComponent({ categories, selectedCategory, onCategoryChange, onApplyFilter, onResetFilter, className = '' }: FilterComponentProps) {
  return (
    <div className={`flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 ${className}`}>
      <Select placeholder="카테고리 선택" options={categories} value={selectedCategory} onChange={onCategoryChange} className="min-w-48" />

      <div className="flex gap-2">
        <Button onClick={onApplyFilter} variant="primary" size="sm">
          필터 적용
        </Button>

        <Button onClick={onResetFilter} variant="ghost" size="sm">
          초기화
        </Button>
      </div>
    </div>
  );
}
