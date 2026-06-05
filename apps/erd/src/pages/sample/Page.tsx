import Container from '@@baseUI/container';
import { FloatingRelationPreview } from '@@editor';

const SamplePage = () => {
  return (
    <Container className="mx-auto w-full max-w-5xl flex-col gap-6 py-8">
      <div>
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Samples</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Relation Sample</h1>
        <p className="mt-2 text-sm text-slate-500">관계선 스타일과 cardinality 마커를 일반 화면에서 바로 확인하는 테스트 페이지입니다.</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-8">
        <FloatingRelationPreview className="mx-auto w-full max-w-[920px]" />
      </div>
    </Container>
  );
};

export default SamplePage;
