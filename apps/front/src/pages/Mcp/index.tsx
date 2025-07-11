import cn from 'classnames';

export const Mcp = () => {
  return (
    <Container className="w-400 border border-pink-300 m-auto h-200 my-8 bg-gray-300 flex-col">
      <h1 className="m-auto flex w-fit text-4xl my-16 h-16 items-center">MCP (Model Context Protocol)</h1>
      <div className="h-152 border border-green-400 flex-col items-center">
        <Typo>Glama</Typo>
        <Typo>MCP.so</Typo>
        <Typo>Smithery</Typo>

        <Typo>Perplexity Ask MCP Server</Typo>
      </div>
    </Container>
  );
};

function Container({ children, className, ...rest }: BaseComponentProps<'div'>) {
  return (
    <div className={cn('Container', className)} {...rest}>
      {children}
    </div>
  );
}

function Typo({ children, className, ...rest }: BaseComponentProps<'p'>) {
  return (
    <p className={cn('Typo', 'flex w-fit m-auto text-2xl', className)} {...rest}>
      {children}
    </p>
  );
}
