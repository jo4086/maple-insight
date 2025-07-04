export interface EnvMapType {
  [key: string]: string;
}

type CallApiURI = string;

interface ApiConfig<T extends { [key: string]: string }> {
  base: CallApiURI;
  secParams?: T;
  category: {
    [key: string]: {
      secParams?: keyof T;
      endpoint: {
        [key: string]: string[];
      };
    };
  };
}

export interface ApiStructure {
  [key: string]: ApiConfig<{ [key: string]: string }>;
}
