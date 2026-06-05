import { Link } from 'react-router-dom';

import Container from '@@baseUI/container';

const HomePage = () => {
  return (
    <Container className="mx-auto w-full max-w-5xl flex-col gap-5 py-8">
      <section className="rounded-3xl border border-slate-200 bg-white px-7 py-6 shadow-sm">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Internal ERD Tool</p>
        <h1 className="mb-3 text-3xl font-semibold tracking-tight text-slate-950">빠르게 테이블 그리고 PostgreSQL DDL까지.</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">무거운 외부 서비스 대신 내부에서 바로 엔티티, 관계, 메모를 관리하고</p>
        <p className="max-w-2xl text-sm leading-6 text-slate-600">PostgreSQL DDL을 복사할 수 있는 가벼운 ERD 편집기입니다.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Link
          to="/erd/new"
          className="rounded-2xl text-white  bg-slate-700/95 p-5 text-left shadow-[1px_1px_1px_2px_rgba(30,50,70,0.3)] transition hover:shadow-[1px_1px_1px_2px_rgba(30,50,70,0.35)] hover:bg-slate-700 outline-none"
        >
          <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] ">Create</p>
          <h2 className="mb-1.5 text-slate-200 text-xl font-semibold">새 ERD 만들기</h2>
          <p className="text-sm leading-5 ">빈 문서에서 시작하고 엔티티와 컬럼을 바로 추가합니다.</p>
        </Link>

        <Link
          to="/erd"
          className="rounded-2xl outline-none bg-white p-5 text-left shadow-[1px_1px_1px_2px_rgba(200,200,200,0.3)] transition hover:shadow-[1px_1px_1px_2px_rgba(200,200,200,0.6)]"
        >
          <p className="mb-1.5 text-[11px] uppercase tracking-[0.22em] text-slate-500">Load</p>
          <h2 className="mb-1.5 text-xl font-semibold text-slate-950">저장된 ERD 불러오기</h2>
          <p className="text-sm leading-5 text-slate-600">기존 문서를 열어서 관계를 계속 정리하고 DDL을 다시 확인합니다.</p>
        </Link>
      </section>
    </Container>
  );
};

export default HomePage;
