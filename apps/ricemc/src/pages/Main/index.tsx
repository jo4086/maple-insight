import { Section } from '@/components/Section';
import { SlideBanner, type Slide } from '@/components/SlideBanner';

const slides: Slide[] = [{ id: '1' }, { id: '2' }];

const Main = () => {
  return (
    <div className="w-full test-4">
      <Section className="flex-x-center test-2">
        <div className="p-4">
          <h1 className="text-2xl font-semibold">Main</h1>
          <p className="text-sm text-gray-600">Main page placeholder.</p>
        </div>
        <SlideBanner slides={slides}></SlideBanner>
      </Section>
    </div>
  );
};

export { Main };
