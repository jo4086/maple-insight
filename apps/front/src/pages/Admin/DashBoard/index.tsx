import React, { useState, type ChangeEvent } from 'react';
import { SelectBox, SelectBox3 } from '@/components';
import { Button, Card, Checkbox, Input, RadioButton, Select } from '@/components/base';
import { FAButton, FileBox, FilterComponent, Preview, Sidebar, UploadFile } from '@/components/feature';
import { sidebarItems } from '@/__TEST__/constants/sidebar.test';
import { UploadPreview } from '@/components/UploadPreview';
import { Modal } from '@/ui/base';

const DashBoard = () => {
  const [framework, setFramework] = useState('');
  const [checked, setChecked] = useState(false);
  const [name, setName] = useState<string>('');
  const [selected, setSelected] = useState('skill');

  const [toggle, setToggle] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const options = [
    { key: 'skill', value: '스킬' },
    { key: 'character', value: '캐릭터' },
    { key: 'equipment', value: '장비' },
    { key: 'union', value: '유니온' },
  ];

  const radioOptions = [
    { value: 'skill', label: '스킬' },
    { value: 'character', label: '캐릭터' },
    { value: 'equipment', label: '장비' },
    { value: 'union', label: '유니온' },
  ];

  const handleClick = (checked: boolean) => {
    setChecked(checked);
  };

  const handleSideToggle = () => {
    setToggle(!toggle);
  };

  return (
    <div>
      {/* Admin Page - DashBoard Route */}
      {/* <Sidebar isCollapsed={toggle} items={sidebarItems} onToggle={handleSideToggle} /> */}
      {/* <CategoryFilter> */}
      {/*   <Label>카테고리 1</Label> */}
      {/*   <SelectBox3 onValueChange={(value) => setFramework(value)} placeholder={framework}> */}
      {/*     <SelectBox3.Trigger /> */}
      {/*     <SelectBox3.Options> */}
      {/*       {options.map((opt) => ( */}
      {/*         <SelectBox3.Option key={opt.key} value={opt.key}> */}
      {/*           {opt.value} */}
      {/*         </SelectBox3.Option> */}
      {/*       ))} */}
      {/*     </SelectBox3.Options> */}
      {/*   </SelectBox3> */}
      {/* </CategoryFilter> */}
      <Card>
        <Button
          onClick={() => {
            setModalOpen((prev) => !prev);
          }}
        >
          버튼
        </Button>
        {/* <Button variant="secondary" disabled={false}> */}
        {/*   버튼 */}
        {/* </Button> */}
        {/* <Checkbox onChange={handleClick} checked={checked} /> */}
        {/* <Input value={name} onChange={(name) => setName(name)} /> */}
        {/* <RadioButton options={radioOptions} name="라디오" value={selected} onChange={(val) => setSelected(val)} /> */}
        {/* <Select options={radioOptions} /> */}
        {/* <FilterComponent categories={radioOptions} /> */}
        <FAButton actions={[{ id: '1', label: '원', icon: '아이콘1' }]} />
        {/* <UploadFile /> */}
        {/* <Preview */}
        {/* <FileBox /> */}
        <UploadPreview />
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="a">
          <div>하이</div>
        </Modal>
      </Card>
    </div>
  );
};

export default DashBoard;

const CategoryFilter = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex w-full bg-teal-100 p-2 items-center gap-2">{children}</div>;
};

const Label = ({ children }: { children: React.ReactNode }) => {
  return <div className="">{children}</div>;
};
