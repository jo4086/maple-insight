import { useState } from 'react';

import SlideBanner, { type Slide } from '@/components/Banners/SlideBanner';
import { Section } from '@/components/Section';

const slides: Slide[] = [
  {
    id: '1',
    imageUrl: '/banners/1.jpg',
    title: '2월 컬리카드 혜택 모아보기',
    subtitle: '기간 한정 최대 14만원 받기',
    period: '02.01 - 02.28',
    className: 'test-1',
  },
  { id: '2', imageUrl: '/banners/2.jpg', title: '타이틀2', className: 'test-2' },
  { id: '3', imageUrl: '/banners/2.jpg', title: '타이틀3', className: 'test-3' },
  { id: '4', imageUrl: '/banners/2.jpg', title: '타이틀4', className: 'test-4' },
];

export const Home = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="w-full test-5">
      {/* ✅ 풀-블리드 배너 (배경/이미지 100%) */}
      {/* <section className="w-full bg-purple-600"> */}
      {/*   <div className="mx-auto max-w-[1080px] px-4 py-10 text-white"> */}
      {/*     <h1 className="text-4xl font-bold">UP TO 90%</h1> */}
      {/*     <p className="mt-2 opacity-90">품절 임박 뷰티 특가</p> */}
      {/*   </div> */}
      {/* </section> */}

      <SlideBanner imageMode="full" slides={slides} autoplayMs={2000} />

      {/* ✅ 나머지 컨텐츠는 1080 컨테이너 */}
      <Section className="test-3">내용</Section>
    </div>
  );
};
