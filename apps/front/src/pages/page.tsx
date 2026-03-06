import { useState } from 'react';

import { Page2 } from './page2';

import { useSendNick } from '@/api/mutations';
import { Container, StickyBox as _StickyBox, TextField } from '@/components';
import { React, cn } from '@/shared';

export const Main = () => {
  const [nick, setNick] = useState('');
  const { mutate, data } = useSendNick();

  interface HandleOnInputProps {
    e: React.FormEvent<HTMLInputElement> | React.ChangeEvent<HTMLInputElement>;
    maxLength: number;
  }
  const handleOnInput = ({ e, maxLength }: HandleOnInputProps) => {
    const target = e.currentTarget;
    const value = target.value;

    if (value.length > maxLength) target.value = value.substr(0, maxLength);
  };

  const handleSubmit = () => {
    mutate(nick);
  };

  return (
    <Container className="flex-col">
      <Header className="flex h-[64px] justify-between px-[330px] items-center">
        <div className="flex items-center p-[12px] w-full h-full justify-between">
          <div className="w-[200px] h-full flex justify-center items-center">로고</div>
          <div className="h-[100%] aspect-square justify-center items-center flex">icon</div>
        </div>
      </Header>

      <Banner className="w-full h-[400px] flex bg-[url(banner.png)] bg-no-repeat bg-cover bg-center items-end justify-center py-5 relative">
        <div className="flex flex-col w-300 mx-auto border justify-center items-center">
          <div className="z-100 w-[600px] h-[140px] mb-[30px]"></div>
          <div className="bg-white flex px-4 rounded-[4px] z-990">
            <TextField
              value={nick}
              onChange={(e) => setNick(e.target.value)}
              onEnter={handleSubmit}
              mode="tailwind"
              label="닉네임"
              tailwinds={{
                root: 'z-1000',
                label: 'border-black',
              }}
            />
          </div>
          <div className="z-100 w-[600px] h-[100px]  "></div>
        </div>
        <div className="absolute w-full h-full bg-gray-700 opacity-60 top-0"></div>
      </Banner>

      <Page2 />
    </Container>
  );
};

function Header({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn('bg-yellow-200 w-full', className)} {...rest}>
      {children}
    </div>
  );
}

function Banner({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  );
}

function Section({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn(className)} {...rest}>
      {children}
    </div>
  );
}

function Divider({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn('w-[310px] h-[200px]  ', className)} {...rest}>
      {children}
    </div>
  );
}
