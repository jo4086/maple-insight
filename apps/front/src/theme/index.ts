type ThemeMap = {
  light: string;
  dark: string;
};

type Mode = 'light' | 'dark' | 'main';
type ColorCategory = 'text' | 'bg' | 'border';
type SemanticColor = 'pri' | 'sec' | 'ter' | 'danger' | 'error' | 'warning' | 'success';

type Category = 'size' | 'width' | 'pd' | 'mg';

const themeTable: Record<string, ThemeMap> = {
  bg: {
    light: 'bg-white',
    dark: 'bg-dark',
  },
  text: {},
};

export const theme = () => {};
