import { Container } from '@/layout';
import clsx from 'clsx';
export const Fab = (props) => {
  const { className } = props;

  const isClass = className ? true : false;
  console.log(isClass);

  return (
    <Container className={`fixed top-20 right-2 border-indigo-300 border p-4 ${className ? className : ''}`}>
      <span className={clsx('font-bold', isClass && 'text-red-200', !isClass && 'text-blue-400', 'text-yellow')}>
        Floating Action Button
      </span>
    </Container>
  );
};
