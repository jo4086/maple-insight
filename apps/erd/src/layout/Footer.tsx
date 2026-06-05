import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  if (/^\/erd\/[^/]+$/.test(location.pathname)) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
      ERD Lab internal tool
    </div>
  );
};
export default Footer;
