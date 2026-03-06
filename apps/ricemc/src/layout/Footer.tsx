import type React from 'react';

const Footer = (props: { className?: string; children?: React.ReactNode }) => {
  return (
    <div className={`flex border-t border-t-gray-300 p-3 m-0 bg-gray-200 ${props.className}`}>
      <ul className="flex flex-col justify-center items-center w-[1024px] m-auto">
        <li className="flex text-3xl font-bold text-gray-600">© 2026 RiceMC</li>
        <ul className="flex flex-col text-md items-center text-sm">
          <li>Java Edition</li>
          <li>server.ricemc.net</li>
        </ul>
      </ul>
    </div>
  );
};

export default Footer;
